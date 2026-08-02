import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import IncidentPortal from "./pages/IncidentPortal";
import IncidentManagement from "./pages/IncidentManagement";
import StrategicInsights from "./pages/StrategicInsights";
import InstallPWA from "./components/InstallPWA";
import OfficialLogin from "./components/OfficialLogin";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isOfficial = localStorage.getItem("isOfficial") === "true";
    setIsAuthenticated(isOfficial);
    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <OfficialLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rastaflow-theme-v2">
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
          {/* Cyber/Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          {/* Glowing Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/15 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[128px] opacity-70 animate-blob pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-600/15 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[128px] opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-yellow-500/20 dark:bg-yellow-600/15 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[128px] opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

          <div className="relative z-10 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<IncidentManagement />} />
                <Route path="/predict" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/report" element={<IncidentPortal />} />
                <Route path="/insights" element={<StrategicInsights />} />
              </Routes>
            </main>
          </div>
          
          {/* PWA Install Banner */}
          <InstallPWA />
        </div>
      </Router>
    </ThemeProvider>
  );
}