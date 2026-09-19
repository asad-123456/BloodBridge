import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Global haptic feedback for mobile devices
document.addEventListener("pointerdown", (e) => {
  const target = e.target as HTMLElement;
  if (target.closest("button") || target.closest("a")) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15); // Light physical tap on mobile
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
