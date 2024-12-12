import React from "react";
import { createRoot } from "react-dom/client";
import Main from "./src/Main";
import "./index.css";
import { StreamsContextProvider } from "./src/context/streamsContext/StreamsContext";
import { SignalContextProvider } from "./src/context/signalContext/SignalContext";
import { StreamEffectsContextProvider } from "./src/context/streamEffectsContext/StreamEffectsContext";
import { PermissionsContextProvider } from "./src/context/permissionsContext/PermissionsContext";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(<App />);

function App() {
  return (
    <StreamsContextProvider>
      <StreamEffectsContextProvider>
        <SignalContextProvider>
          <PermissionsContextProvider>
            <Main />
          </PermissionsContextProvider>
        </SignalContextProvider>
      </StreamEffectsContextProvider>
    </StreamsContextProvider>
  );
}
