import React, { createContext, useContext, useRef } from "react";
import { TableSvgsType } from "./lib/typeConstant";

export interface TableStaticContentContextProviderProps {
  children: React.ReactNode;
}

export interface TableStaticContentContextType {
  tableSvgs: React.MutableRefObject<TableSvgsType>;
}

const TableStaticContentContext = createContext<
  TableStaticContentContextType | undefined
>(undefined);

export const useTableStaticContentContext = () => {
  const context = useContext(TableStaticContentContext);
  if (!context) {
    throw new Error(
      "useTableStaticContentContext must be used within an TableStaticContentContextProvider"
    );
  }
  return context;
};

export function TableStaticContentContextProvider({
  children,
}: TableStaticContentContextProviderProps) {
  const tableSvgs = useRef<TableSvgsType>({});

  return (
    <TableStaticContentContext.Provider value={{ tableSvgs }}>
      {children}
    </TableStaticContentContext.Provider>
  );
}

export default TableStaticContentContext;
