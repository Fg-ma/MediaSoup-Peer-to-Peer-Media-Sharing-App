import React from "react";
import { createRoot } from "react-dom/client";
import Main from "./src/Main";
import "./index.css";
import { StreamsContextProvider } from "./src/context/streamsContext/StreamsContext";
import { SignalContextProvider } from "./src/context/signalContext/SignalContext";
import { EffectsStylesContextProvider } from "./src/context/effectsStylesContext/EffectsStylesContext";
import { PermissionsContextProvider } from "./src/context/permissionsContext/PermissionsContext";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(<App />);

function App() {
  return (
    <StreamsContextProvider>
      <EffectsStylesContextProvider>
        <SignalContextProvider>
          <PermissionsContextProvider>
            <Main />
          </PermissionsContextProvider>
        </SignalContextProvider>
      </EffectsStylesContextProvider>
    </StreamsContextProvider>
  );
}
