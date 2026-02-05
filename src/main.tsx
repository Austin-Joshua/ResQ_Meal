import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}>
          <div style={{ maxWidth: 480 }}>
            <h1 style={{ fontSize: 18, marginBottom: 8 }}>Something went wrong</h1>
            <pre style={{
              padding: 16,
              background: "#f1f5f9",
              borderRadius: 8,
              overflow: "auto",
              fontSize: 13,
            }}>
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                marginTop: 16,
                padding: "8px 16px",
                background: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
