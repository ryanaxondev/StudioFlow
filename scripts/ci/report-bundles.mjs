import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

import { chromium } from "@playwright/test";

const artifactsDirectory = resolve(process.cwd(), "artifacts");
const reportPath = resolve(artifactsDirectory, "bundle-report.json");

const ordinaryBudget = 170 * 1024;
const imageReviewBudget = 300 * 1024;
const host = "127.0.0.1";
const port = Number(process.env.BUNDLE_REPORT_PORT ?? 3210);
const baseUrl = `http://${host}:${port}`;

// M03 has no Product routes yet. Add concrete routes here as P0 Screens land.
// The Image Review allowance is reserved now so the CI contract is stable.
const routeChecks = [
  {
    route: "/",
    budgetBytes: ordinaryBudget,
    budgetKind: "ordinary-screen",
  },
];

function sleep(milliseconds) {
  return new Promise((resolvePromise) =>
    setTimeout(resolvePromise, milliseconds),
  );
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health/live`);
      if (response.ok) {
        return;
      }
      lastError = new Error(
        `Health endpoint returned HTTP ${response.status}.`,
      );
    } catch (error) {
      lastError = error;
    }

    await sleep(250);
  }

  throw new Error("Timed out waiting for the production server.", {
    cause: lastError,
  });
}

async function gzipAssetSize(url) {
  const response = await fetch(url, {
    headers: { "accept-encoding": "identity" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}.`);
  }

  const contents = Buffer.from(await response.arrayBuffer());
  return gzipSync(contents).byteLength;
}

function isInitialNextScript(request, pageOrigin) {
  if (request.resourceType() !== "script") {
    return false;
  }

  const candidate = new URL(request.url());
  return (
    candidate.origin === pageOrigin &&
    candidate.pathname.startsWith("/_next/static/") &&
    candidate.pathname.endsWith(".js")
  );
}

async function measureRoute(browser, { route, budgetBytes, budgetKind }) {
  const pageUrl = new URL(route, baseUrl);
  const assetUrls = new Set();
  const page = await browser.newPage();

  page.on("requestfinished", (request) => {
    if (isInitialNextScript(request, pageUrl.origin)) {
      assetUrls.add(request.url());
    }
  });

  try {
    const response = await page.goto(pageUrl.toString(), {
      waitUntil: "load",
      timeout: 30_000,
    });

    if (!response?.ok()) {
      throw new Error(
        `Failed to load ${route}: HTTP ${response?.status() ?? "unknown"}.`,
      );
    }

    // Capture chunks requested immediately by hydration without counting
    // speculative URLs merely referenced by HTML or manifests.
    await page.waitForLoadState("networkidle", { timeout: 10_000 });
  } finally {
    await page.close();
  }

  const urls = [...assetUrls].sort();
  if (urls.length === 0) {
    throw new Error(
      `No initial Next.js JavaScript requests were observed for ${route}.`,
    );
  }

  const files = [];
  let gzipBytes = 0;

  for (const assetUrl of urls) {
    const assetGzipBytes = await gzipAssetSize(assetUrl);
    gzipBytes += assetGzipBytes;
    files.push({
      url: new URL(assetUrl).pathname,
      gzipBytes: assetGzipBytes,
      gzipKilobytes: Number((assetGzipBytes / 1024).toFixed(2)),
    });
  }

  return {
    route,
    budgetKind,
    gzipBytes,
    gzipKilobytes: Number((gzipBytes / 1024).toFixed(2)),
    budgetBytes,
    budgetKilobytes: budgetBytes / 1024,
    withinBudget: gzipBytes <= budgetBytes,
    files,
  };
}

function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolvePromise) => {
    const forceKillTimer = setTimeout(() => {
      server.kill("SIGKILL");
    }, 5_000);

    server.once("exit", () => {
      clearTimeout(forceKillTimer);
      resolvePromise();
    });

    server.kill("SIGTERM");
  });
}

const server = spawn(
  "pnpm",
  ["exec", "next", "start", "--hostname", host, "--port", String(port)],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "production",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

server.stdout.on("data", (chunk) => process.stdout.write(`[next] ${chunk}`));
server.stderr.on("data", (chunk) => process.stderr.write(`[next] ${chunk}`));

let browser;
let failed = false;

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  const routes = [];
  for (const routeCheck of routeChecks) {
    const result = await measureRoute(browser, routeCheck);
    routes.push(result);
    failed ||= !result.withinBudget;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    measurement:
      "gzip of initial /_next/static JavaScript actually requested by Chromium during production navigation",
    budgets: {
      ordinaryScreenGzipKilobytes: ordinaryBudget / 1024,
      imageReviewGzipKilobytes: imageReviewBudget / 1024,
    },
    routes,
  };

  await mkdir(artifactsDirectory, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.table(
    routes.map(({ route, gzipKilobytes, budgetKilobytes, withinBudget }) => ({
      route,
      "gzip KB": gzipKilobytes,
      "budget KB": budgetKilobytes,
      pass: withinBudget,
    })),
  );

  for (const result of routes) {
    console.log(`Initial JavaScript for ${result.route}:`);
    console.table(
      [...result.files]
        .sort((left, right) => right.gzipBytes - left.gzipBytes)
        .map(({ url, gzipKilobytes }) => ({ url, "gzip KB": gzipKilobytes })),
    );
  }

  console.log(`Bundle report written to ${reportPath}`);

  if (failed) {
    throw new Error(
      "One or more routes exceed the approved client JavaScript budget.",
    );
  }
} finally {
  if (browser) {
    await browser.close();
  }
  await stopServer(server);
}
