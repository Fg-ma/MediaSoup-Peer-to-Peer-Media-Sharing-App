import React, { createContext, useContext, useRef } from "react";
import { TableSidePanels } from "../../tableSidePanel/TableSidePanel";
import { CurrentSettingsType } from "./lib/typeConstant";

export interface GeneralContextProviderProps {
  children: React.ReactNode;
}

export interface GeneralContextType {
  activeSidePanel: React.MutableRefObject<TableSidePanels>;
  currentSettingsActive: React.MutableRefObject<CurrentSettingsType[]>;
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined);

export const useGeneralContext = () => {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error(
      "useGeneralContext must be used within an GeneralContextProvider",
    );
  }
  return context;
};

export function GeneralContextProvider({
  children,
}: GeneralContextProviderProps) {
  const activeSidePanel = useRef<TableSidePanels>("general");
  const currentSettingsActive = useRef<CurrentSettingsType[]>([]);

  return (
    <GeneralContext.Provider value={{ activeSidePanel, currentSettingsActive }}>
      {children}
    </GeneralContext.Provider>
  );
}

export default GeneralContext;
