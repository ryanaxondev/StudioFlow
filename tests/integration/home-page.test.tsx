// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage from "../../src/app/page";

afterEach(cleanup);

describe("home page", () => {
  it("renders the application foundation", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "StudioFlow" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Application foundation")).toBeInTheDocument();
  });
});
