import React from "react";
import { createRoot } from "react-dom/client";
import { MediaContextProvider } from "./src/context/mediaContext/MediaContext";
import { SignalContextProvider } from "./src/context/signalContext/SignalContext";
import { UploadDownloadContextProvider } from "./src/context/uploadDownloadContext/UploadDownloadContext";
import { ToolsContextProvider } from "./src/context/toolsContext/ToolsContext";
import { EffectsContextProvider } from "./src/context/effectsContext/EffectsContext";
import { PermissionsContextProvider } from "./src/context/permissionsContext/PermissionsContext";
import { SocketContextProvider } from "./src/context/socketContext/SocketContext";
import { UserInfoContextProvider } from "./src/context/userInfoContext/UserInfoContext";
import { GeneralContextProvider } from "./src/context/generalContext/GeneralContext";
import { TableContextProvider } from "./src/context/tableContext/TableContext";
import Main from "./src/Main";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(<App />);

function App() {
  return (
    <GeneralContextProvider>
      <MediaContextProvider>
        <EffectsContextProvider>
          <SignalContextProvider>
            <PermissionsContextProvider>
              <SocketContextProvider>
                <UserInfoContextProvider>
                  <UploadDownloadContextProvider>
                    <ToolsContextProvider>
                      <TableContextProvider>
                        <Main />
                      </TableContextProvider>
                    </ToolsContextProvider>
                  </UploadDownloadContextProvider>
                </UserInfoContextProvider>
              </SocketContextProvider>
            </PermissionsContextProvider>
          </SignalContextProvider>
        </EffectsContextProvider>
      </MediaContextProvider>
    </GeneralContextProvider>
  );
}
