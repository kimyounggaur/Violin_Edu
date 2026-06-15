import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Fingerboard } from "./Fingerboard";

describe("Fingerboard", () => {
  it("renders the four violin strings and the 20 beginner-position touch targets", () => {
    render(<Fingerboard selectedKey="A:1" includeChromatic={false} onSelect={vi.fn()} />);

    expect(screen.getByText("G")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /현/ })).toHaveLength(20);
  });

  it("adds chromatic low and high finger positions only when requested", () => {
    const { rerender } = render(<Fingerboard selectedKey="A:1" includeChromatic={false} onSelect={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /낮은 1번/ })).not.toBeInTheDocument();

    rerender(<Fingerboard selectedKey="A:L1" includeChromatic onSelect={vi.fn()} />);

    expect(screen.getAllByRole("button", { name: /현/ })).toHaveLength(32);
    expect(screen.getByRole("button", { name: /A현 L1번 손가락/ })).toBeInTheDocument();
  });
});
