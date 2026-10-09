import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/grenze-gotisch/600";
import "@fontsource/grenze-gotisch/800";
import "@fontsource/manrope/500";
import "@fontsource/manrope/700";
import "@fontsource/manrope/800";
import "@fontsource/martian-mono/400";
import "@fontsource/martian-mono/600";
import "./styles/board.css";
import "./styles/hoard.css";
import "./styles/memex.css";
import { App } from "./App";
import { Memex } from "./components/Memex";

const isMemex = window.location.pathname.replace(/\/$/, "") === "/lotnok";

createRoot(document.getElementById("root")!).render(<StrictMode>{isMemex ? <Memex /> : <App />}</StrictMode>);
