import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Show loading indicator immediately
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fafafa;">
      <div style="text-align:center;color:#333;">
        <div style="width:40px;height:40px;border:3px solid #e5e5e5;border-top-color:#333;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
        <p style="font-family:-apple-system,sans-serif;font-size:14px;">Ładowanie...</p>
      </div>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  `;
  
  // Render app after short delay to ensure DOM is ready
  setTimeout(() => {
    try {
      createRoot(rootElement).render(<App />);
    } catch (error) {
      console.error('App render error:', error);
      rootElement.innerHTML = `
        <div style="padding:20px;font-family:-apple-system,sans-serif;">
          <h2>Błąd ładowania</h2>
          <p>${error}</p>
        </div>
      `;
    }
  }, 100);
} else {
  console.error('Root element not found');
}
