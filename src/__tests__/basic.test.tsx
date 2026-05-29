import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

function DummyComponent() {
  return <div data-testid="dummy">Hello, Testing!</div>;
}

describe("Basic Setup Test", () => {
  it("renders the component successfully", () => {
    render(<DummyComponent />);
    const el = screen.getByTestId("dummy");
    expect(el.textContent).toBe("Hello, Testing!");
  });
});
