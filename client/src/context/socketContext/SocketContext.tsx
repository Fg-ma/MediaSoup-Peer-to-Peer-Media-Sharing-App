import React, { createContext, useContext, useRef } from "react";
import MediasoupSocketController from "../../lib/MediasoupSocketController";
import TableSocketController from "../../lib/TableSocketController";

export interface SocketContextProviderProps {
  children: React.ReactNode;
}

export interface SocketContextType {
  tableSocket: React.MutableRefObject<TableSocketController | undefined>;
  mediasoupSocket: React.MutableRefObject<
    MediasoupSocketController | undefined
  >;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error(
      "useSocketContext must be used within an SocketContextProvider"
    );
  }
  return context;
};

export function SocketContextProvider({
  children,
}: SocketContextProviderProps) {
  const tableSocket = useRef<TableSocketController | undefined>();
  const mediasoupSocket = useRef<MediasoupSocketController | undefined>();

  return (
    <SocketContext.Provider
      value={{
        tableSocket,
        mediasoupSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export default SocketContext;
