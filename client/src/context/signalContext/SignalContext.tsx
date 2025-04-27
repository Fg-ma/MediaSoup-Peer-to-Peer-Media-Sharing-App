import React, { createContext, useContext } from "react";
import {
  GeneralSignals,
  GroupSignals,
  NewInstanceSignals,
} from "./lib/typeConstant";

export interface SignalContextProviderProps {
  children: React.ReactNode;
}

export interface SignalContextType {
  addGeneralSignalListener: (
    listener: (signal: GeneralSignals) => void,
  ) => void;
  removeGeneralSignalListener: (
    listener: (signal: GeneralSignals) => void,
  ) => void;
  sendGeneralSignal: (signal: GeneralSignals) => void;
  addNewInstanceSignalListener: (
    listener: (signal: NewInstanceSignals) => void,
  ) => void;
  removeNewInstanceSignalListener: (
    listener: (signal: NewInstanceSignals) => void,
  ) => void;
  sendNewInstanceSignal: (signal: NewInstanceSignals) => void;
  addGroupSignalListener: (listener: (signal: GroupSignals) => void) => void;
  removeGroupSignalListener: (listener: (signal: GroupSignals) => void) => void;
  sendGroupSignal: (signal: GroupSignals) => void;
}

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export const useSignalContext = () => {
  const context = useContext(SignalContext);
  if (!context) {
    throw new Error(
      "useSignalContext must be used within an SignalContextProvider",
    );
  }
  return context;
};

export function SignalContextProvider({
  children,
}: SignalContextProviderProps) {
  const generalSignalListeners: Set<(signal: GeneralSignals) => void> =
    new Set();
  const newInstanceSignalListeners: Set<(signal: NewInstanceSignals) => void> =
    new Set();
  const groupSignalListeners: Set<(signal: GroupSignals) => void> = new Set();

  const addGeneralSignalListener = (
    listener: (signal: GeneralSignals) => void,
  ): void => {
    generalSignalListeners.add(listener);
  };

  const removeGeneralSignalListener = (
    listener: (signal: GeneralSignals) => void,
  ): void => {
    generalSignalListeners.delete(listener);
  };

  const sendGeneralSignal = (signal: GeneralSignals) => {
    generalSignalListeners.forEach((listener) => {
      listener(signal);
    });
  };

  const addNewInstanceSignalListener = (
    listener: (signal: NewInstanceSignals) => void,
  ): void => {
    newInstanceSignalListeners.add(listener);
  };

  const removeNewInstanceSignalListener = (
    listener: (signal: NewInstanceSignals) => void,
  ): void => {
    newInstanceSignalListeners.delete(listener);
  };

  const sendNewInstanceSignal = (signal: NewInstanceSignals) => {
    newInstanceSignalListeners.forEach((listener) => {
      listener(signal);
    });
  };

  const addGroupSignalListener = (
    listener: (signal: GroupSignals) => void,
  ): void => {
    groupSignalListeners.add(listener);
  };

  const removeGroupSignalListener = (
    listener: (signal: GroupSignals) => void,
  ): void => {
    groupSignalListeners.delete(listener);
  };

  const sendGroupSignal = (signal: GroupSignals) => {
    groupSignalListeners.forEach((listener) => {
      listener(signal);
    });
  };

  return (
    <SignalContext.Provider
      value={{
        addGeneralSignalListener,
        removeGeneralSignalListener,
        sendGeneralSignal,
        addNewInstanceSignalListener,
        removeNewInstanceSignalListener,
        sendNewInstanceSignal,
        addGroupSignalListener,
        removeGroupSignalListener,
        sendGroupSignal,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
}

export default SignalContext;
