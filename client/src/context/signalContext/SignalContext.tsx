import React, { createContext, useContext, useRef } from "react";
import {
  GeneralSignals,
  GroupSignals,
  MediaPositioningSignals,
  NewInstanceSignals,
  SettingsSignals,
} from "./lib/typeConstant";
import { ContentTypes } from "../../../../universal/contentTypeConstant";

export interface SignalContextProviderProps {
  children: React.ReactNode;
}

export interface SignalContextType {
  selected: React.MutableRefObject<
    {
      type: ContentTypes;
      id: string;
      username?: string;
      instance?: string;
      isUser?: boolean;
    }[]
  >;
  addGeneralSignalListener: (
    listener: (signal: GeneralSignals) => void,
  ) => void;
  removeGeneralSignalListener: (
    listener: (signal: GeneralSignals) => void,
  ) => void;
  sendGeneralSignal: (signal: GeneralSignals) => void;
  addSettingsSignalListener: (
    listener: (signal: SettingsSignals) => void,
  ) => void;
  removeSettingsSignalListener: (
    listener: (signal: SettingsSignals) => void,
  ) => void;
  sendSettingsSignal: (signal: SettingsSignals) => void;
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
  addMediaPositioningSignalListener: (
    listener: (signal: MediaPositioningSignals) => void,
  ) => void;
  removeMediaPositioningSignalListener: (
    listener: (signal: MediaPositioningSignals) => void,
  ) => void;
  sendMediaPositioningSignal: (signal: MediaPositioningSignals) => void;
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
  const selected = useRef<
    {
      type: ContentTypes;
      id: string;
      username?: string;
      instance?: string;
      isUser?: boolean;
    }[]
  >([]);

  const generalSignalListeners: Set<(signal: GeneralSignals) => void> =
    new Set();
  const settingsSignalListeners: Set<(signal: SettingsSignals) => void> =
    new Set();
  const newInstanceSignalListeners: Set<(signal: NewInstanceSignals) => void> =
    new Set();
  const groupSignalListeners: Set<(signal: GroupSignals) => void> = new Set();
  const mediaPositioningSignalListeners: Set<
    (signal: MediaPositioningSignals) => void
  > = new Set();

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

  const addSettingsSignalListener = (
    listener: (signal: SettingsSignals) => void,
  ): void => {
    settingsSignalListeners.add(listener);
  };

  const removeSettingsSignalListener = (
    listener: (signal: SettingsSignals) => void,
  ): void => {
    settingsSignalListeners.delete(listener);
  };

  const sendSettingsSignal = (signal: SettingsSignals) => {
    settingsSignalListeners.forEach((listener) => {
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
      if (signal.type === "groupChange") {
        selected.current = signal.data.selected;
      }

      listener(signal);
    });
  };

  const addMediaPositioningSignalListener = (
    listener: (signal: MediaPositioningSignals) => void,
  ): void => {
    mediaPositioningSignalListeners.add(listener);
  };

  const removeMediaPositioningSignalListener = (
    listener: (signal: MediaPositioningSignals) => void,
  ): void => {
    mediaPositioningSignalListeners.delete(listener);
  };

  const sendMediaPositioningSignal = (signal: MediaPositioningSignals) => {
    mediaPositioningSignalListeners.forEach((listener) => {
      listener(signal);
    });
  };

  return (
    <SignalContext.Provider
      value={{
        selected,
        addGeneralSignalListener,
        removeGeneralSignalListener,
        sendGeneralSignal,
        addSettingsSignalListener,
        removeSettingsSignalListener,
        sendSettingsSignal,
        addNewInstanceSignalListener,
        removeNewInstanceSignalListener,
        sendNewInstanceSignal,
        addGroupSignalListener,
        removeGroupSignalListener,
        sendGroupSignal,
        addMediaPositioningSignalListener,
        removeMediaPositioningSignalListener,
        sendMediaPositioningSignal,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
}

export default SignalContext;
