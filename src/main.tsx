import React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BrowserRouter as Router } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./index.css"
import App from "./App";

// 에러 바운더리 컴포넌트
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>앱에 문제가 발생했습니다</h1>
          <p>에러: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            페이지 새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
const queryClient = new QueryClient();

// console.log("[main.tsx] Starting app render");
// console.log("[main.tsx] Root container:", container);
// console.log("[main.tsx] Root element:", root);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// console.log("[main.tsx] App render completed");
