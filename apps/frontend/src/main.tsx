import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initTheme } from "./utils/theme.ts";

initTheme();

const rootElement = document.getElementById("root");
if (!rootElement) {
   throw new Error(
      "Root element not found. Make sure there's a <div id='root'></div> in your HTML.",
   );
}
createRoot(rootElement).render(
   <StrictMode>
      <App />
   </StrictMode>,
);
