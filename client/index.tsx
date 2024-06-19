import React from "react";
import { createRoot } from "react-dom/client";
import Main from "./src/Main";
import "./index.css";
import "./scrollbar.css";
import { StreamsContextProvider } from "./src/context/StreamsContext";
import { CurrentEffectsStylesContextProvider } from "./src/context/CurrentEffectsStylesContext";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(<App />);

function App() {
  return (
    <StreamsContextProvider>
      <CurrentEffectsStylesContextProvider>
        <Main />
      </CurrentEffectsStylesContextProvider>
    </StreamsContextProvider>
  );
}
