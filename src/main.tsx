import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/unbounded/700";
import "@fontsource/unbounded/900";
import "@fontsource/golos-text/500";
import "@fontsource/golos-text/700";
import "@fontsource/golos-text/800";
import "@fontsource/spline-sans-mono/500";
import "@fontsource/spline-sans-mono/600";
import "./styles/board.css";
import "./styles/space.css";
import "./styles/memex.css";
import { App } from "./App";
import { Memex } from "./components/Memex";

const isMemex = window.location.pathname.replace(/\/$/, "") === "/lotnok";

createRoot(document.getElementById("root")!).render(<StrictMode>{isMemex ? <Memex /> : <App />}</StrictMode>);
