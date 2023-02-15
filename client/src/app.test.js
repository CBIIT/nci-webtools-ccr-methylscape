import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders main element", () => {
  render(<App />);
  const mainElement = screen.getByRole("main");
  expect(mainElement).toBeInTheDocument();
});
