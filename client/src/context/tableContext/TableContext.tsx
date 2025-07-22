import React, { createContext, useContext, useRef } from "react";
import TableBabylonScene from "../../tableBabylon/TableBabylonScene";

export interface TableContextProviderProps {
  children: React.ReactNode;
}

export interface TableContextType {
  tableBabylonCanvasRef: React.RefObject<HTMLCanvasElement>;
  tableBabylonScene: React.MutableRefObject<TableBabylonScene | undefined>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error(
      "useTableContext must be used within an TableContextProvider",
    );
  }
  return context;
};

export function TableContextProvider({ children }: TableContextProviderProps) {
  const tableBabylonCanvasRef = useRef<HTMLCanvasElement>(null);
  const tableBabylonScene = useRef<TableBabylonScene | undefined>(undefined);

  return (
    <TableContext.Provider value={{ tableBabylonCanvasRef, tableBabylonScene }}>
      {children}
    </TableContext.Provider>
  );
}

export default TableContext;
