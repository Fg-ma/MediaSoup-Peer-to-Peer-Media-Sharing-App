import React, { createContext, useContext, useRef } from "react";
import MediasoupSocketController from "../../serverControllers/mediasoupServer/MediasoupSocketController";
import TableSocketController from "../../serverControllers/tableServer/TableSocketController";
import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import UserStaticContentSocketController from "../../serverControllers/userStaticContentServer/UserStaticContentSocketController";
import LiveTextEditingSocketController from "../../serverControllers/liveTextEditingServer/LiveTextEditingSocketController";
import GamesServerController from "../../serverControllers/gamesServer/GamesServerController";
import VideoSocketController from "src/serverControllers/videoServer/VideoSocketController";

export interface SocketContextProviderProps {
  children: React.ReactNode;
}

export interface SocketContextType {
  tableSocket: React.MutableRefObject<TableSocketController | undefined>;
  liveTextEditingSocket: React.MutableRefObject<
    LiveTextEditingSocketController | undefined
  >;
  mediasoupSocket: React.MutableRefObject<
    MediasoupSocketController | undefined
  >;
  tableStaticContentSocket: React.MutableRefObject<
    TableStaticContentSocketController | undefined
  >;
  userStaticContentSocket: React.MutableRefObject<
    UserStaticContentSocketController | undefined
  >;
  videoSocket: React.MutableRefObject<VideoSocketController | undefined>;
  gamesSocket: React.MutableRefObject<GamesServerController | undefined>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error(
      "useSocketContext must be used within an SocketContextProvider",
    );
  }
  return context;
};

export function SocketContextProvider({
  children,
}: SocketContextProviderProps) {
  const tableSocket = useRef<TableSocketController | undefined>();
  const liveTextEditingSocket = useRef<
    LiveTextEditingSocketController | undefined
  >();
  const mediasoupSocket = useRef<MediasoupSocketController | undefined>();
  const tableStaticContentSocket = useRef<
    TableStaticContentSocketController | undefined
  >();
  const userStaticContentSocket = useRef<
    UserStaticContentSocketController | undefined
  >();
  const videoSocket = useRef<VideoSocketController | undefined>();
  const gamesSocket = useRef<GamesServerController | undefined>();

  return (
    <SocketContext.Provider
      value={{
        tableSocket,
        liveTextEditingSocket,
        mediasoupSocket,
        tableStaticContentSocket,
        userStaticContentSocket,
        videoSocket,
        gamesSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export default SocketContext;
