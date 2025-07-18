import React from "react";
import { useGeneralContext } from "../../../context/generalContext/GeneralContext";
import SvgSettingsPanel from "./lib/svgSettings/SvgSettingsPanel";
import ImageSettingsPanel from "./lib/imageSettings/ImageSettingsPanel";
import TextSettingsPanel from "./lib/textSettings/TextSettingsPanel";
import VideoSettingsPanel from "./lib/videoSettings/VideoSettingsPanel";
import VisualMediaSettingsPanel from "./lib/visualMediaSettings/VisualMediaSettingsPanel";
import AudioSettingsPanel from "./lib/audioSettings/AudioSettingsPanel";

export default function SettingsPanel({
  setExternalRerender,
}: {
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentSettingsActive } = useGeneralContext();

  return (
    <div className="flex flex-col items-center justify-start">
      {currentSettingsActive.current.map((active) =>
        active.contentType === "svg" ? (
          <SvgSettingsPanel
            key={active.instanceId}
            instanceId={active.instanceId}
            setExternalRerender={setExternalRerender}
          />
        ) : active.contentType === "image" ? (
          <ImageSettingsPanel
            key={active.instanceId}
            instanceId={active.instanceId}
            setExternalRerender={setExternalRerender}
          />
        ) : active.contentType === "text" ? (
          <TextSettingsPanel
            key={active.instanceId}
            instanceId={active.instanceId}
            setExternalRerender={setExternalRerender}
          />
        ) : active.contentType === "video" ? (
          <VideoSettingsPanel
            key={active.instanceId}
            instanceId={active.instanceId}
            setExternalRerender={setExternalRerender}
          />
        ) : active.contentType === "camera" ||
          active.contentType === "screen" ? (
          active.visualMediaInfo && (
            <VisualMediaSettingsPanel
              key={active.instanceId}
              contentType={active.contentType}
              instanceId={active.instanceId}
              isUser={active.visualMediaInfo.isUser}
              username={active.visualMediaInfo.username}
              instance={active.visualMediaInfo.instance}
              setExternalRerender={setExternalRerender}
            />
          )
        ) : active.contentType === "audio" ? (
          active.visualMediaInfo && (
            <AudioSettingsPanel
              key={active.instanceId}
              instanceId={active.instanceId}
              isUser={active.visualMediaInfo.isUser}
              username={active.visualMediaInfo.username}
              instance={active.visualMediaInfo.instance}
              setExternalRerender={setExternalRerender}
            />
          )
        ) : null,
      )}
    </div>
  );
}
