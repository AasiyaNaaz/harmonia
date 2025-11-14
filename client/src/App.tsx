import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Studio from "@/pages/Studio";
import Genre from "@/pages/Genre";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/studio" component={Studio} />
      <Route path="/genre/:genre" component={Genre} />
      <Route component={NotFound} />
    </Switch>
  );
}



function App() {
  // Persisted dark mode toggle
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved === "true") return true;
      if (saved === "false") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* Dark mode toggle placed top right, visible on all pages */}
        <div className="fixed top-5 right-6 z-50">
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="px-3 py-2 rounded bg-gray-300 dark:bg-gray-700 shadow text-black dark:text-white"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
