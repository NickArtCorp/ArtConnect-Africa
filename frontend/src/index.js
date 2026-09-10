import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import "@/radix-z-fix.css";
import App from "@/App";

// Handle dynamic chunk loading errors (e.g. after fresh deployment or rebuild)
window.addEventListener("error", (event) => {
  if (
    event?.message?.includes("Loading chunk") ||
    event?.message?.includes("ChunkLoadError") ||
    (event?.target && event?.target?.tagName === "SCRIPT" && event?.target?.src?.includes(".chunk.js"))
  ) {
    const hasReloaded = sessionStorage.getItem("chunk_reload_attempt");
    if (!hasReloaded) {
      sessionStorage.setItem("chunk_reload_attempt", "true");
      window.location.reload();
    }
  }
});

// Clear reload flag on successful load
sessionStorage.removeItem("chunk_reload_attempt");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
