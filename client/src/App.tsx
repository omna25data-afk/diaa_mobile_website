import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Download from "./pages/Download";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/services" component={Services} /><Route path="/about" component={About} /><Route path="/download" component={Download} /><Route path="/contact" component={Contact} /><Route path="/admin" component={Admin} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Router /><Toaster position="top-center" richColors /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
