import React, { createContext, useContext, useRef } from "react";
import { io, Socket } from "socket.io-client";
import TableSocketController from "src/lib/TableSocketController";

const websocketURL = "http://localhost:8000";

export interface SocketContextProviderProps {
  children: React.ReactNode;
}

export interface SocketContextType {
  tableSocket: React.MutableRefObject<TableSocketController | undefined>;
  mediasoupSocket: React.MutableRefObject<Socket>;
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
  const mediasoupSocket = useRef<Socket>(io(websocketURL));

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
