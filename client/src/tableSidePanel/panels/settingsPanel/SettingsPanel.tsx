import React from "react";
import { ContentTypes } from "../../../../../universal/contentTypeConstant";
import SvgSettingsPanel from "./lib/svgSettings/SvgSettingsPanel";
import ImageSettingsPanel from "./lib/imageSettings/ImageSettingsPanel";
import TextSettingsPanel from "./lib/textSettings/TextSettingsPanel";
import VideoSettingsPanel from "./lib/videoSettings/VideoSettingsPanel";
import VisualMediaSettingsPanel from "./lib/visualMediaSettings/VisualMediaSettingsPanel";

export default function SettingsPanel({
  currentSettingsActive,
}: {
  currentSettingsActive: React.MutableRefObject<
    | {
        contentType: ContentTypes;
        instanceId: string;
        visualMediaInfo?: {
          isUser: boolean;
          username: string;
          instance: string;
        };
      }
    | undefined
  >;
}) {
  return (
    <div className="flex flex-col items-center justify-start">
      {currentSettingsActive.current &&
        (currentSettingsActive.current.contentType === "svg" ? (
          <SvgSettingsPanel currentSettingsActive={currentSettingsActive} />
        ) : currentSettingsActive.current.contentType === "image" ? (
          <ImageSettingsPanel currentSettingsActive={currentSettingsActive} />
        ) : currentSettingsActive.current.contentType === "text" ? (
          <TextSettingsPanel currentSettingsActive={currentSettingsActive} />
        ) : currentSettingsActive.current.contentType === "video" ? (
          <VideoSettingsPanel currentSettingsActive={currentSettingsActive} />
        ) : currentSettingsActive.current.contentType === "camera" ||
          currentSettingsActive.current.contentType === "screen" ? (
          <VisualMediaSettingsPanel
            currentSettingsActive={currentSettingsActive}
          />
        ) : null)}
    </div>
  );
}
