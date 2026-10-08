import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/alfa-slab-one/400";
import "@fontsource/courier-prime/400";
import "@fontsource/courier-prime/700";
import "@fontsource/league-gothic/400";
import "@fontsource/pt-serif/400";
import "@fontsource/pt-serif/400-italic";
import "@fontsource/pt-serif/700";
import "@fontsource/archivo-narrow/500";
import "@fontsource/archivo-narrow/600";
import "@fontsource/archivo-narrow/700";
import "./styles/base.css";
import "./styles/gazette.css";
import "./styles/memex.css";
import { App } from "./App";
import { Memex } from "./components/Memex";

const isMemex = window.location.pathname.replace(/\/$/, "") === "/memex";

createRoot(document.getElementById("root")!).render(<StrictMode>{isMemex ? <Memex /> : <App />}</StrictMode>);
