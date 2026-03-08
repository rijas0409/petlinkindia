import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Failed to bootstrap app:", error);
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui;">
      <div style="max-width:420px;text-align:center;border:1px solid #e5e7eb;border-radius:16px;padding:20px;">
        <h1 style="margin:0 0 8px;font-size:20px;">App failed to start</h1>
        <p style="margin:0;color:#6b7280;">Please refresh this page. If the issue persists, reopen the app link.</p>
      </div>
    </div>
  `;
}
