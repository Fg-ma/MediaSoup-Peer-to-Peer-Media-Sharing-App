import React from "react";
import { ContentTypes } from "../../../../../universal/contentTypeConstant";
import SvgSettingsPanel from "./lib/svgSettings/SvgSettingsPanel";
import ImageSettingsPanel from "./lib/imageSettings/ImageSettingsPanel";
import TextSettingsPanel from "./lib/textSettings/TextSettingsPanel";
import VideoSettingsPanel from "./lib/videoSettings/VideoSettingsPanel";

export default function SettingsPanel({
  currentSettingsActive,
}: {
  currentSettingsActive: React.MutableRefObject<
    | {
        contentType: ContentTypes;
        instanceId: string;
      }
    | undefined
  >;
}) {
  return (
    <>
      {currentSettingsActive.current &&
        (currentSettingsActive.current.contentType === "svg" ? (
          <SvgSettingsPanel currentSettingsActive={currentSettingsActive} />
        ) : currentSettingsActive.current.contentType === "image" ? (
          <ImageSettingsPanel currentSettingsActive={currentSettingsActive} />
        ) : currentSettingsActive.current.contentType === "text" ? (
          <TextSettingsPanel currentSettingsActive={currentSettingsActive} />
        ) : currentSettingsActive.current.contentType === "video" ? (
          <VideoSettingsPanel currentSettingsActive={currentSettingsActive} />
        ) : null)}
    </>
  );
}
