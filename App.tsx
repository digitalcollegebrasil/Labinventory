import React from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";

import { Layout } from "./components/layout/Layout";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Layout />
        <Toaster position="top-right" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
