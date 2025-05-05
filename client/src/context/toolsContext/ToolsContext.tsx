import React, { createContext, useContext, useRef } from "react";
import Uploader from "../../uploader/Uploader";

export interface ToolsContextProviderProps {
  children: React.ReactNode;
}

export interface ToolsContextType {
  uploader: React.MutableRefObject<Uploader | undefined>;
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

  return (
    <ToolsContext.Provider value={{ uploader }}>
      {children}
    </ToolsContext.Provider>
  );
}

export default ToolsContext;
