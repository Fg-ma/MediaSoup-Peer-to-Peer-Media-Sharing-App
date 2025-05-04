import React, { createContext, useContext, useRef } from "react";
import { TableUpload, UploadSignals } from "./lib/typeConstant";

export interface UploadContextProviderProps {
  children: React.ReactNode;
}

export interface UploadContextType {
  addUploadSignalListener: (listener: (signal: UploadSignals) => void) => void;
  removeUploadSignalListener: (
    listener: (signal: UploadSignals) => void,
  ) => void;
  sendUploadSignal: (signal: UploadSignals) => void;
  addCurrentUpload: (id: string, upload: TableUpload) => void;
  removeCurrentUpload: (id: string) => void;
  getCurrentUploads: () => {
    [filename: string]: TableUpload;
  };
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUploadContext = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error(
      "useUploadContext must be used within an UploadContextProvider",
    );
  }
  return context;
};

export function UploadContextProvider({
  children,
}: UploadContextProviderProps) {
  const currentUploads = useRef<{
    [filename: string]: TableUpload;
  }>({
    // hia: {
    //   filename: "hisa",
    //   progress: 0.89,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola: {
    //   filename: "hisa",
    //   progress: 0.15,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola3: {
    //   filename: "hisa",
    //   progress: 0.25,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola4: {
    //   filename: "hisa",
    //   progress: 0.6,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola23: {
    //   filename: "hisa",
    //   progress: 0.72,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola32: {
    //   filename: "hisa",
    //   progress: 0.27,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola42: {
    //   filename: "hisa",
    //   progress: 0.26,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola232: {
    //   filename: "hisa",
    //   progress: 0.15,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola3232: {
    //   filename: "hisa",
    //   progress: 0.0,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola4232: {
    //   filename: "hisa",
    //   progress: 0.77,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola1231: {
    //   filename: "hisa",
    //   progress: 0.5,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola312312: {
    //   filename: "hisa",
    //   progress: 0.2,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola4123123: {
    //   filename: "hisa",
    //   progress: 0.8,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola123124: {
    //   filename: "hisa",
    //   progress: 0.3,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola314124: {
    //   filename: "hisa",
    //   progress: 0.5,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
    // hola414214: {
    //   filename: "hisa",
    //   progress: 0.9,
    //   paused: false,
    //   mimeType: "svg",
    //   uploadUrl: "asdasd",
    //   size: 102,
    // },
  });
  const uploadSignalListeners: Set<(signal: UploadSignals) => void> = new Set();

  const addUploadSignalListener = (
    listener: (signal: UploadSignals) => void,
  ): void => {
    uploadSignalListeners.add(listener);
  };

  const removeUploadSignalListener = (
    listener: (signal: UploadSignals) => void,
  ): void => {
    uploadSignalListeners.delete(listener);
  };

  const handleUploadSignal = (signal: UploadSignals) => {
    switch (signal.type) {
      case "uploadProgress":
        currentUploads.current[signal.header.contentId].progress =
          signal.data.progress;
        break;
      default:
        break;
    }
  };

  const sendUploadSignal = (signal: UploadSignals) => {
    uploadSignalListeners.forEach((listener) => {
      handleUploadSignal(signal);

      listener(signal);
    });
  };

  const addCurrentUpload = (id: string, upload: TableUpload) => {
    if (currentUploads.current[id]) return;

    currentUploads.current[id] = upload;
  };

  const removeCurrentUpload = (id: string) => {
    if (!currentUploads.current[id]) return;

    URL.revokeObjectURL(currentUploads.current[id].uploadUrl);

    delete currentUploads.current[id];
  };

  const getCurrentUploads = () => {
    return currentUploads.current;
  };

  return (
    <UploadContext.Provider
      value={{
        addUploadSignalListener,
        removeUploadSignalListener,
        sendUploadSignal,
        addCurrentUpload,
        removeCurrentUpload,
        getCurrentUploads,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export default UploadContext;
