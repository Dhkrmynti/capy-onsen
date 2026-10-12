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
import "./styles/brawl.css";
import "./styles/seat.css";
import "./styles/memex.css";
import { App } from "./App";
import { Memex } from "./components/Memex";

const isMemex = window.location.pathname.replace(/\/$/, "") === "/lotnok";

// No StrictMode: its dev-only double mount tears down the 3D room's name tags mid-render and leaves the chairs empty.
createRoot(document.getElementById("root")!).render(isMemex ? <Memex /> : <App />);
