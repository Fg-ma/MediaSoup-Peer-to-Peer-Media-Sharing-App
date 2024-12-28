import React from "react";
import { createRoot } from "react-dom/client";
import { MediaContextProvider } from "./src/context/mediaContext/MediaContext";
import { SignalContextProvider } from "./src/context/signalContext/SignalContext";
import { EffectsContextProvider } from "./src/context/effectsContext/EffectsContext";
import { PermissionsContextProvider } from "./src/context/permissionsContext/PermissionsContext";
import { SocketContextProvider } from "./src/context/socketContext/SocketContext";
import Main from "./src/Main";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(<App />);

function App() {
  return (
    <MediaContextProvider>
      <EffectsContextProvider>
        <SignalContextProvider>
          <PermissionsContextProvider>
            <SocketContextProvider>
              <Main />
            </SocketContextProvider>
          </PermissionsContextProvider>
        </SignalContextProvider>
      </EffectsContextProvider>
    </MediaContextProvider>
  );
}
