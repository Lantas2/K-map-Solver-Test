import { useEffect, useMemo, useState } from "react";
import "./citools.css";
import HomePage from "./pages/HomePage";
import DigitalElectronicsPage from "./pages/DigitalElectronicsPage";
import AboutPage from "./pages/AboutPage";
import AcademicOriginPage from "./pages/AcademicOriginPage";
import { ToolRouteHeader } from "./components/Layout";

const TOOL_ROUTES = {
  "/digital-electronics/kmap": { mode: "kmap", title: "K-Map Solver" },
  "/digital-electronics/logic-lab": { mode: "learning", title: "Learning Mode" },
  "/digital-electronics/circuit-ide": { mode: "deep", title: "Circuit IDE" },
};

const BASE_NAME = import.meta.env.BASE_URL.replace(/\/$/, "");

function normalizedPath() {
  const redirectedRoute = new URLSearchParams(window.location.search).get("route");

  if (redirectedRoute) {
    window.history.replaceState({}, "", externalPath(redirectedRoute));
    return redirectedRoute.length > 1 ? redirectedRoute.replace(/\/$/, "") : redirectedRoute;
  }

  let path = window.location.pathname;
  if (BASE_NAME && path.startsWith(BASE_NAME)) {
    path = path.slice(BASE_NAME.length) || "/";
  }
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

function externalPath(path) {
  if (path === "/") return BASE_NAME ? `${BASE_NAME}/` : "/";
  return BASE_NAME ? `${BASE_NAME}${path}` : path;
}

export default function CIToolsApp({ ToolWorkspace }) {
  const [path, setPath] = useState(normalizedPath);

  useEffect(() => {
    const onPopState = () => setPath(normalizedPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPath) => {
    window.history.pushState({}, "", externalPath(nextPath));
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const toolRoute = useMemo(() => TOOL_ROUTES[path], [path]);

  useEffect(() => {
    const title = toolRoute
      ? `${toolRoute.title} · CITools`
      : path === "/digital-electronics"
        ? "Elektronika Digital · CITools"
        : path === "/about"
          ? "About · CITools"
          : path === "/academic-origin"
            ? "Academic Origin · CITools"
            : "CITools · Cokroaminoto informatika tool";
    document.title = title;
  }, [path, toolRoute]);

  if (toolRoute) {
    return (
      <div className="cit-tool-route">
        <ToolRouteHeader title={toolRoute.title} onNavigate={navigate} />
        <ToolWorkspace
          initialMode={toolRoute.mode}
          onNavigateMode={(mode) => {
            const target = Object.entries(TOOL_ROUTES).find(([, meta]) => meta.mode === mode)?.[0];
            if (target) navigate(target);
          }}
          onExit={() => navigate("/digital-electronics")}
        />
      </div>
    );
  }

  if (path === "/digital-electronics") {
    return <DigitalElectronicsPage onNavigate={navigate} />;
  }

  if (path === "/about") {
    return <AboutPage onNavigate={navigate} />;
  }

  if (path === "/academic-origin") {
    return <AcademicOriginPage onNavigate={navigate} />;
  }

  return <HomePage onNavigate={navigate} />;
}
