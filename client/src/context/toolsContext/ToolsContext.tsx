import React, { createContext, useContext, useRef } from "react";
import Uploader from "../../uploader/Uploader";
import UserDevice from "../../lib/UserDevice";
import IndexedDB from "../../db/indexedDB/IndexedDB";

export interface ToolsContextProviderProps {
  children: React.ReactNode;
}

export interface ToolsContextType {
  uploader: React.MutableRefObject<Uploader | undefined>;
  userDevice: React.MutableRefObject<UserDevice>;
  indexedDBController: React.MutableRefObject<IndexedDB>;
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
  const indexedDBController = useRef(new IndexedDB());

  return (
    <ToolsContext.Provider
      value={{ uploader, userDevice, indexedDBController }}
    >
      {children}
    </ToolsContext.Provider>
  );
}

export default ToolsContext;
