import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/schibsted-grotesk/600";
import "@fontsource/schibsted-grotesk/800";
import "@fontsource/schibsted-grotesk/900";
import "@fontsource/stix-two-text/400";
import "@fontsource/stix-two-text/400-italic";
import "@fontsource/stix-two-text/600-italic";
import "@fontsource/geist-mono/400";
import "@fontsource/geist-mono/500";
import "./styles/board.css";
import "./styles/void.css";
import "./styles/memex.css";
import { App } from "./App";
import { Memex } from "./components/Memex";

const isMemex = window.location.pathname.replace(/\/$/, "") === "/lotnok";

createRoot(document.getElementById("root")!).render(<StrictMode>{isMemex ? <Memex /> : <App />}</StrictMode>);
