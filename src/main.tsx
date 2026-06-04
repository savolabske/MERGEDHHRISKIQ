
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

type RootErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class RootErrorBoundary extends React.Component<React.PropsWithChildren, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown): RootErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }

  componentDidCatch(error: unknown) {
    // Keep runtime details in the console for debugging.
    console.error("Root render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background grid place-items-center p-6">
          <div className="max-w-[640px] w-full bg-card border border-border rounded-md px-5 py-5 text-foreground-emphasis">
            <h1 className="m-0 mb-2 text-xl font-bold">Something went wrong</h1>
            <p className="m-0 mb-3 text-secondary-foreground">
              The app hit a runtime error while loading. Refresh the page or check the browser console for details.
            </p>
            <pre className="m-0 whitespace-pre-wrap break-words text-destructive-text text-sm">
              {this.state.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
  