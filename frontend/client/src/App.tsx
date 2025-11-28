import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/hooks/useAppContext";
import GuitarGarageBand from "@/components/GuitarGarageBand";  

// Pages
import Home from "@/pages/Home";
import Studio from "@/pages/Studio";
import GenrePageWrapper from "@/pages/GenrePageWrapper";
import NotFound from "@/pages/not-found";
import PopVideoPage from "@/pages/PopVideoPage";
import PopLearnPage from "@/pages/PopLearnPage";
import ClassicalLearnPage from "@/pages/ClassicalLearnPage";
import VoiceGenreRandomAnalyzer from "@/pages/VoiceGenreRandomAnalyzer";


function Router() {
  return (
    <Switch>
      {/* Home */}
      <Route path="/" component={Home} />

      {/* Studio */}
      <Route path="/studio" component={Studio} />

      {/* Pop genre custom routes */}
      <Route path="/genre/pop" component={PopVideoPage} />
      <Route path="/genre/pop/info" component={GenrePageWrapper} />
      <Route path="/genre/pop/learn" component={PopLearnPage} />


 <Route path="/voice-genre-random" component={VoiceGenreRandomAnalyzer} />


      {/* All other genres */}
  <Route path="/genre/:genre" component={GenrePageWrapper} />
  {/* wouter Route uses `component` not `element` */}
  <Route path="/guitar" component={GuitarGarageBand} />

<Route path="/genre/classical/info" component={GenrePageWrapper} />
<Route path="/genre/classical/learn" component={ClassicalLearnPage} />


      {/* Default /404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />

        {/* Global Application State */}
        <AppProvider>
          <Router />
        </AppProvider>

      </TooltipProvider>
    </QueryClientProvider>
  );
}
