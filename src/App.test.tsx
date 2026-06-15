import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App shell", () => {
  it("renders the mobile-first violin learning shell", () => {
    render(<App />);

    expect(screen.getByRole("banner")).toHaveTextContent("운지 마스터");
    expect(screen.getByLabelText("선택한 음")).toHaveTextContent("A4");
    expect(screen.getByRole("tab", { name: "탐색" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "계이름" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "퀴즈" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "연습곡" })).toBeInTheDocument();
  });
});
