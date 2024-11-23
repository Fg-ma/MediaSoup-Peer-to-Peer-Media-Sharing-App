import React from "react";
import { createRoot } from "react-dom/client";
import Main from "./src/Main";
import "./index.css";
import { StreamsContextProvider } from "./src/context/streamsContext/StreamsContext";
import { SignalContextProvider } from "./src/context/signalContext/SignalContext";
import { CurrentEffectsStylesContextProvider } from "./src/context/currentEffectsStylesContext/CurrentEffectsStylesContext";

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
