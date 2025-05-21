import React, { createContext, useContext, useRef } from "react";
import ChunkedUploader from "../../tools/uploader/lib/chunkUploader/ChunkUploader";
import { DownloadSignals, UploadSignals } from "./lib/typeConstant";
import Downloader from "../../tools/downloader/Downloader";

export interface UploadDownloadContextProviderProps {
  children: React.ReactNode;
}

export interface UploadDownloadContextType {
  addUploadSignalListener: (listener: (signal: UploadSignals) => void) => void;
  removeUploadSignalListener: (
    listener: (signal: UploadSignals) => void,
  ) => void;
  sendUploadSignal: (signal: UploadSignals) => void;
  addCurrentUpload: (id: string, upload: ChunkedUploader) => void;
  removeCurrentUpload: (id: string) => void;
  getCurrentUploads: () => {
    [filename: string]: ChunkedUploader;
  };
  addDownloadSignalListener: (
    listener: (signal: DownloadSignals) => void,
  ) => void;
  removeDownloadSignalListener: (
    listener: (signal: DownloadSignals) => void,
  ) => void;
  sendDownloadSignal: (signal: DownloadSignals) => void;
  addCurrentDownload: (id: string, upload: Downloader) => void;
  removeCurrentDownload: (id: string) => void;
  getCurrentDownloads: () => {
    [filename: string]: Downloader;
  };
}

const UploadDownloadContext = createContext<
  UploadDownloadContextType | undefined
>(undefined);

export const useUploadDownloadContext = () => {
  const context = useContext(UploadDownloadContext);
  if (!context) {
    throw new Error(
      "useUploadDownloadContext must be used within an UploadDownloadContextProvider",
    );
  }
  return context;
};

export function UploadDownloadContextProvider({
  children,
}: UploadDownloadContextProviderProps) {
  const currentUploads = useRef<{
    [filename: string]: ChunkedUploader;
  }>({});
  const currentDownloads = useRef<{
    [filename: string]: Downloader;
  }>({});
  const uploadSignalListeners: Set<(signal: UploadSignals) => void> = new Set();
  const downloadSignalListeners: Set<(signal: DownloadSignals) => void> =
    new Set();

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

  const sendUploadSignal = (signal: UploadSignals) => {
    uploadSignalListeners.forEach((listener) => {
      listener(signal);
    });
  };

  const addCurrentUpload = (id: string, upload: ChunkedUploader) => {
    if (currentUploads.current[id]) return;

    currentUploads.current[id] = upload;
  };

  const removeCurrentUpload = (id: string) => {
    if (!currentUploads.current[id]) return;

    delete currentUploads.current[id];
  };

  const getCurrentUploads = () => {
    return currentUploads.current;
  };

  const addDownloadSignalListener = (
    listener: (signal: DownloadSignals) => void,
  ): void => {
    downloadSignalListeners.add(listener);
  };

  const removeDownloadSignalListener = (
    listener: (signal: DownloadSignals) => void,
  ): void => {
    downloadSignalListeners.delete(listener);
  };

  const sendDownloadSignal = (signal: DownloadSignals) => {
    downloadSignalListeners.forEach((listener) => {
      listener(signal);
    });
  };

  const addCurrentDownload = (id: string, download: Downloader) => {
    if (currentDownloads.current[id]) return;

    currentDownloads.current[id] = download;
  };

  const removeCurrentDownload = (id: string) => {
    if (!currentDownloads.current[id]) return;

    delete currentDownloads.current[id];
  };

  const getCurrentDownloads = () => {
    return currentDownloads.current;
  };

  return (
    <UploadDownloadContext.Provider
      value={{
        addUploadSignalListener,
        removeUploadSignalListener,
        sendUploadSignal,
        addCurrentUpload,
        removeCurrentUpload,
        getCurrentUploads,
        addDownloadSignalListener,
        removeDownloadSignalListener,
        sendDownloadSignal,
        addCurrentDownload,
        removeCurrentDownload,
        getCurrentDownloads,
      }}
    >
      {children}
    </UploadDownloadContext.Provider>
  );
}

export default UploadDownloadContext;
