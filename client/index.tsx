import React from "react";
import { createRoot } from "react-dom/client";
import Main from "./src/Main";
import "./index.css";
import "./scrollbar.css";
import { StreamsContextProvider } from "./src/context/StreamsContext";
import { CurrentEffectsStylesContextProvider } from "./src/context/CurrentEffectsStylesContext";
import { SignalContextProvider } from "./src/context/SignalContext";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(<App />);

function App() {
  return (
    <StreamsContextProvider>
      <CurrentEffectsStylesContextProvider>
        <SignalContextProvider>
          <Main />
        </SignalContextProvider>
      </CurrentEffectsStylesContextProvider>
    </StreamsContextProvider>
  );
}
