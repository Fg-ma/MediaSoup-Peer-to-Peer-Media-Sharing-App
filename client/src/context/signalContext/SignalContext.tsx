import React, { createContext, useContext, useState } from "react";
import { StaticContentTypes } from "../../../../universal/contentTypeConstant";

export type Signals =
  | undefined
  | {
      type: "localMuteChange";
      header: {
        table_id: string;
        username: string;
        instance: string;
        producerType: "audio" | "screenAudio";
        producerId: string | undefined;
      };
    }
  | {
      type: "startInstancesDrag";
      data: {
        instances: {
          contentType: StaticContentTypes;
          contentId: string;
          width: number;
          height: number;
        }[];
      };
    }
  | {
      type: "stopInstancesDrag";
    };

export interface SignalContextProviderProps {
  children: React.ReactNode;
}

export interface SignalContextType {
  signal: Signals;
  setSignal: React.Dispatch<React.SetStateAction<Signals>>;
  addSignalListener: (listener: (signal: Signals) => void) => void;
  removeSignalListener: (listener: (signal: Signals) => void) => void;
  sendSignal: (signal: Signals) => void;
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
  const [signal, setSignal] = useState<Signals>(undefined);

  const signalListeners: Set<(signal: Signals) => void> = new Set();

  const sendSignal = (signal: Signals) => {
    signalListeners.forEach((listener) => {
      listener(signal);
    });
  };

  const addSignalListener = (listener: (signal: Signals) => void): void => {
    signalListeners.add(listener);
  };

  const removeSignalListener = (listener: (signal: Signals) => void): void => {
    signalListeners.delete(listener);
  };

  return (
    <SignalContext.Provider
      value={{
        signal,
        setSignal,
        addSignalListener,
        removeSignalListener,
        sendSignal,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
}

export default SignalContext;
