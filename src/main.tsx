import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/big-shoulders-stencil-display/800";
import "@fontsource/big-shoulders-stencil-display/900";
import "@fontsource/archivo/500";
import "@fontsource/archivo/700";
import "@fontsource/archivo/800";
import "@fontsource/martian-mono/400";
import "@fontsource/martian-mono/600";
import "./styles/board.css";
import "./styles/signal.css";
import "./styles/memex.css";
import { App } from "./App";
import { Memex } from "./components/Memex";

const isMemex = window.location.pathname.replace(/\/$/, "") === "/lotnok";

createRoot(document.getElementById("root")!).render(<StrictMode>{isMemex ? <Memex /> : <App />}</StrictMode>);
