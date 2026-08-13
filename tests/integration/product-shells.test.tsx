// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { AgencyShell } from "../../src/components/shell/agency-shell";
import { ClientShell } from "../../src/components/shell/client-shell";
import { InvitationAcceptance } from "../../src/modules/invitations/components/invitation-acceptance";

let pathname = "/agency";
let workspaceId = "workspace-a";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams({ workspaceId }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const ownerWorkspace = {
  workspaceId: "workspace-a",
  workspaceName: "StudioFlow Local",
  role: "AGENCY_OWNER" as const,
  canViewDelivery: true,
  canViewProjects: true,
  canViewClients: true,
  canManageMembers: true,
  defaultPath: "/agency" as const,
};

const restrictedWorkspace = {
  workspaceId: "workspace-a",
  workspaceName: "StudioFlow Local",
  role: "AGENCY_MEMBER" as const,
  canViewDelivery: false,
  canViewProjects: true,
  canViewClients: false,
  canManageMembers: false,
  defaultPath: "/agency/projects" as const,
};

describe("M08 product shells", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    pathname = "/agency";
    workspaceId = "workspace-a";
  });

  test("Agency shell exposes stable primary navigation and current context", () => {
    render(
      <AgencyShell workspaces={[ownerWorkspace]}>
        <p>Agency content</p>
      </AgencyShell>,
    );

    const primaryNavigation = screen.getByRole("navigation", {
      name: "Primary",
    });
    expect(primaryNavigation).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Primary mobile" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "StudioFlow workspace rail" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("StudioFlow Local").length).toBeGreaterThan(0);
    expect(
      within(primaryNavigation).getByRole("link", { name: "Delivery" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getAllByRole("link", { name: "Projects" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Clients" }).length,
    ).toBeGreaterThan(0);
  });

  test("Agency shell labels member management as the active workspace context", () => {
    pathname = "/agency/settings/members";

    render(
      <AgencyShell workspaces={[ownerWorkspace]}>
        <p>Agency member content</p>
      </AgencyShell>,
    );

    expect(screen.getByLabelText("Current context")).toHaveTextContent(
      "Agency members",
    );
    const primaryNavigation = screen.getByRole("navigation", {
      name: "Primary",
    });
    expect(
      within(primaryNavigation).getByRole("link", { name: "Agency members" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("restricted Agency navigation renders only policy-authorized destinations", async () => {
    pathname = "/agency/projects";

    render(
      <AgencyShell workspaces={[restrictedWorkspace]}>
        <p>Restricted agency content</p>
      </AgencyShell>,
    );

    const primaryNavigation = screen.getByRole("navigation", {
      name: "Primary",
    });
    expect(
      within(primaryNavigation).getByRole("link", { name: "Projects" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(primaryNavigation).queryByRole("link", { name: "Delivery" }),
    ).not.toBeInTheDocument();
    expect(
      within(primaryNavigation).queryByRole("link", { name: "Clients" }),
    ).not.toBeInTheDocument();
    expect(
      within(primaryNavigation).queryByRole("link", {
        name: "Agency members",
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "StudioFlow" })).toHaveAttribute(
      "href",
      "/agency/projects?workspaceId=workspace-a",
    );

    const mobileNavigation = screen.getByRole("navigation", {
      name: "Primary mobile",
    });
    expect(
      within(mobileNavigation).getByRole("link", { name: "Projects" }),
    ).toBeInTheDocument();
    expect(
      within(mobileNavigation).queryByRole("link", { name: "Delivery" }),
    ).not.toBeInTheDocument();
    expect(
      within(mobileNavigation).queryByRole("link", { name: "Clients" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getAllByRole("button", { name: "Search StudioFlow" })[0]!,
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Search StudioFlow",
    });
    expect(
      within(dialog).getByRole("link", { name: /Open projects/ }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("link", { name: /Open delivery/ }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("link", { name: /Open clients/ }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("link", { name: /Manage agency members/ }),
    ).not.toBeInTheDocument();
  });

  test("mobile navigation sheet opens with managed focus", async () => {
    render(
      <AgencyShell workspaces={[ownerWorkspace]}>
        <p>Agency content</p>
      </AgencyShell>,
    );

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", {
      name: "StudioFlow navigation",
    });
    expect(dialog).toBeInTheDocument();
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    fireEvent.keyDown(document.activeElement ?? dialog, { key: "Escape" });
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test("search dialog traps focus and exposes capability-aware command groups", async () => {
    render(
      <AgencyShell workspaces={[ownerWorkspace]}>
        <p>Agency content</p>
      </AgencyShell>,
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "Search StudioFlow" })[0]!,
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Search StudioFlow",
    });
    const searchInput = screen.getByLabelText("Search StudioFlow", {
      selector: "input",
    });
    const openDelivery = within(dialog).getByRole("link", {
      name: /Open delivery/,
    });
    const openProjects = within(dialog).getByRole("link", {
      name: /Open projects/,
    });
    const openClients = within(dialog).getByRole("link", {
      name: /Open clients/,
    });
    const manageMembers = within(dialog).getByRole("link", {
      name: /Manage agency members/,
    });

    expect(searchInput).toHaveFocus();
    expect(dialog).toHaveTextContent("Recent");
    expect(dialog).toHaveTextContent("Quick actions");
    expect(dialog).toHaveTextContent("Operational health");
    expect(dialog).toHaveTextContent("Assigned delivery work");
    expect(dialog).toHaveTextContent("Client organizations");
    expect(dialog).toHaveTextContent("Roles and workspace access");

    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    expect(openDelivery).toHaveFocus();
    fireEvent.keyDown(openDelivery, { key: "ArrowDown" });
    expect(openProjects).toHaveFocus();
    fireEvent.keyDown(openProjects, { key: "ArrowDown" });
    expect(openClients).toHaveFocus();
    fireEvent.keyDown(openClients, { key: "ArrowDown" });
    expect(manageMembers).toHaveFocus();
    fireEvent.keyDown(manageMembers, { key: "ArrowUp" });
    expect(openClients).toHaveFocus();
    fireEvent.keyDown(openDelivery, { key: "ArrowUp" });
    expect(searchInput).toHaveFocus();
  });

  test("Client shell uses agency-first top navigation and StudioFlow attribution", () => {
    pathname = "/portal";
    render(
      <ClientShell
        agencyName="Sableframe Studio"
        clientOrganizationName="Kestrelon"
      >
        <p>Client content</p>
      </ClientShell>,
    );

    expect(
      screen.getByRole("navigation", { name: "Client Portal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText(/Connected through/)).toBeInTheDocument();
    expect(screen.getByText("Powered by")).toBeInTheDocument();
    expect(
      screen.getByText("StudioFlow", { selector: "strong" }),
    ).toBeInTheDocument();
  });

  test("invitation acceptance exposes a real loading status while scope is checked", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => undefined)),
    );

    render(<InvitationAcceptance token="pending-invitation-token" />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Checking invitation");
    expect(status).toHaveTextContent(
      "Verifying the access scope and invited identity.",
    );
  });
});
