import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/600";
import "@fontsource/barlow-condensed/800";
import "@fontsource/barlow-condensed/900";
import "@fontsource/barlow/500";
import "@fontsource/barlow/600";
import "@fontsource/barlow/700";
import "@fontsource/jetbrains-mono/500";
import "@fontsource/jetbrains-mono/700";
import "./styles/board.css";
import "./styles/hazard.css";
import "./styles/memex.css";
import { App } from "./App";
import { Memex } from "./components/Memex";

const isMemex = window.location.pathname.replace(/\/$/, "") === "/lotnok";

createRoot(document.getElementById("root")!).render(<StrictMode>{isMemex ? <Memex /> : <App />}</StrictMode>);
