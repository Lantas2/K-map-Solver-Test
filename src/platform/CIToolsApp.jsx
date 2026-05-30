import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "./citools.css";
import "../styles/toolWorkspace.css";
import HomePage from "./pages/HomePage";
import DigitalElectronicsPage from "./pages/DigitalElectronicsPage";
import AboutPage from "./pages/AboutPage";
import AcademicOriginPage from "./pages/AcademicOriginPage";

const TOOL_ROUTES = {
  "/digital-electronics/kmap": { mode: "kmap", title: "K-Map Solver" },
  "/digital-electronics/logic-lab": { mode: "learning", title: "Learning Mode" },
  "/digital-electronics/circuit-ide": { mode: "deep", title: "Circuit IDE" },
};

const MARKETING_PAGE_ORDER = {
  "/": 0,
  "/digital-electronics": 1,
  "/academic-origin": 2,
  "/about": 3,
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
  if (path === "/") {
    return BASE_NAME ? `${BASE_NAME}/` : "/";
  }

  return BASE_NAME ? `${BASE_NAME}${path}` : path;
}

function getMarketingTransitionDirection(fromPath, toPath) {
  const fromOrder = MARKETING_PAGE_ORDER[fromPath];
  const toOrder = MARKETING_PAGE_ORDER[toPath];

  if (
    fromOrder === undefined ||
    toOrder === undefined ||
    fromOrder === toOrder
  ) {
    return null;
  }

  return toOrder > fromOrder ? "forward" : "backward";
}

function isRouteMotionReduced() {
  const preference = window.localStorage.getItem("citools-motion");

  if (preference === "reduced") return true;
  if (preference === "full") return false;

  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function getRouteTransition(fromPath, toPath) {
  const pageDirection = getMarketingTransitionDirection(fromPath, toPath);

  if (pageDirection) {
    // Returning to CIT already has the cinematic Home entrance. Keep that
    // behavior untouched so G2 only fills the missing outward transition.
    if (toPath === "/" && fromPath !== "/") {
      return null;
    }

    return {
      type: "page",
      direction: pageDirection,
      fromPath,
      toPath,
    };
  }

  const fromTool = TOOL_ROUTES[fromPath];
  const toTool = TOOL_ROUTES[toPath];

  if (fromPath === "/digital-electronics" && toTool) {
    return {
      type: "tool-open",
      toolId: toTool.mode,
    };
  }

  if (fromTool && toPath === "/digital-electronics") {
    return {
      type: "tool-close",
      toolId: fromTool.mode,
    };
  }

  return null;
}

export default function CIToolsApp({ ToolWorkspace }) {
  const [path, setPath] = useState(normalizedPath);
  const currentPathRef = useRef(path);
  const routeTransitionRef = useRef(null);

  const renderPath = useCallback((nextPath, routeTransition = null) => {
    const updatePage = () => {
      flushSync(() => {
        currentPathRef.current = nextPath;
        setPath(nextPath);
      });

      window.scrollTo({ top: 0, behavior: "auto" });
    };

    const supportsTransition =
      typeof document.startViewTransition === "function";

    if (!routeTransition || isRouteMotionReduced() || !supportsTransition) {
      routeTransitionRef.current?.skipTransition?.();
      updatePage();
      return;
    }

    routeTransitionRef.current?.skipTransition?.();

    const root = document.documentElement;

    if (routeTransition.type === "page") {
      root.dataset.citPageDirection = routeTransition.direction;
      root.dataset.citPageFrom = routeTransition.fromPath === "/" ? "home" : "inner";
      root.dataset.citPageTo = routeTransition.toPath === "/" ? "home" : "inner";
    }

    if (
      routeTransition.type === "tool-open" ||
      routeTransition.type === "tool-close"
    ) {
      root.dataset.citToolTransition =
        routeTransition.type === "tool-open" ? "open" : "close";
      root.dataset.citTool = routeTransition.toolId;
    }

    const transition = document.startViewTransition(updatePage);
    routeTransitionRef.current = transition;

    transition.finished.finally(() => {
      if (routeTransitionRef.current === transition) {
        routeTransitionRef.current = null;
        delete root.dataset.citPageDirection;
        delete root.dataset.citPageFrom;
        delete root.dataset.citPageTo;
        delete root.dataset.citToolTransition;
        delete root.dataset.citTool;
      }
    });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const nextPath = normalizedPath();
      const routeTransition = getRouteTransition(
        currentPathRef.current,
        nextPath
      );

      renderPath(nextPath, routeTransition);
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [renderPath]);

  const navigate = (nextPath) => {
    const routeTransition = getRouteTransition(
      currentPathRef.current,
      nextPath
    );

    window.history.pushState({}, "", externalPath(nextPath));
    renderPath(nextPath, routeTransition);
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
        <ToolWorkspace
          initialMode={toolRoute.mode}
          onNavigateMode={(mode) => {
            const target = Object.entries(TOOL_ROUTES).find(
              ([, meta]) => meta.mode === mode
            )?.[0];

            if (target) {
              navigate(target);
            }
          }}
          onExit={() => navigate("/digital-electronics")}
          onHome={() => navigate("/")}
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