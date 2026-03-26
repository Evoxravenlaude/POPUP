import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { initializeTestData } from "@/lib/initializeTestData";
import { initializeFromSupabase } from "@/lib/artistStore";
import "./index.css";

// Clear service worker cache on all devices
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

// Initialize test data only once per version — not on every page load
const TEST_DATA_VERSION = "v1";
if (localStorage.getItem("popup_test_init") !== TEST_DATA_VERSION) {
  initializeTestData();
  localStorage.setItem("popup_test_init", TEST_DATA_VERSION);
}

// Load from Supabase (async, non-blocking)
initializeFromSupabase().catch((err) =>
  console.error("Supabase initialization failed:", err)
);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
