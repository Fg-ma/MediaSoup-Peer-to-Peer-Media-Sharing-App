import React, { createContext, useContext, useRef } from "react";
import MediasoupSocketController from "../../serverControllers/mediasoupServer/MediasoupSocketController";
import TableSocketController from "../../serverControllers/tableServer/TableSocketController";
import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import UserStaticContentSocketController from "../../serverControllers/userStaticContentServer/UserStaticContentSocketController";

export interface SocketContextProviderProps {
  children: React.ReactNode;
}

export interface SocketContextType {
  tableSocket: React.MutableRefObject<TableSocketController | undefined>;
  mediasoupSocket: React.MutableRefObject<
    MediasoupSocketController | undefined
  >;
  tableStaticContentSocket: React.MutableRefObject<
    TableStaticContentSocketController | undefined
  >;
  userStaticContentSocket: React.MutableRefObject<
    UserStaticContentSocketController | undefined
  >;
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
  const mediasoupSocket = useRef<MediasoupSocketController | undefined>();
  const tableStaticContentSocket = useRef<
    TableStaticContentSocketController | undefined
  >();
  const userStaticContentSocket = useRef<
    UserStaticContentSocketController | undefined
  >();

  return (
    <SocketContext.Provider
      value={{
        tableSocket,
        mediasoupSocket,
        tableStaticContentSocket,
        userStaticContentSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export default SocketContext;
