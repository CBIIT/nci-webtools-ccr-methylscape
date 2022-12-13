import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RecoilRoot } from "recoil";
import "./styles/main.scss";
import App from "./app";
import reportWebVitals from "./reportWebVitals";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </StrictMode>
);

Array.from(document.querySelectorAll("[react-cloak]")).forEach((node) => node.removeAttribute("react-cloak"));

reportWebVitals(console.log);
