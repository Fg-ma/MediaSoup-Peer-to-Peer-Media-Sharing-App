import React, { createContext, useContext, useRef } from "react";
import Uploader from "../../uploader/Uploader";
import UserDevice from "../../lib/UserDevice";

export interface ToolsContextProviderProps {
  children: React.ReactNode;
}

export interface ToolsContextType {
  uploader: React.MutableRefObject<Uploader | undefined>;
  userDevice: React.MutableRefObject<UserDevice>;
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const useToolsContext = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error(
      "useToolsContext must be used within an ToolsContextProvider",
    );
  }
  return context;
};

export function ToolsContextProvider({ children }: ToolsContextProviderProps) {
  const uploader = useRef<Uploader | undefined>(undefined);
  const userDevice = useRef(new UserDevice());

  return (
    <ToolsContext.Provider value={{ uploader, userDevice }}>
      {children}
    </ToolsContext.Provider>
  );
}

export default ToolsContext;
