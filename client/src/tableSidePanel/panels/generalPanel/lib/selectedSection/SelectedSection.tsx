import React, { useEffect, useState } from "react";
import { useSignalContext } from "../../../../../context/signalContext/SignalContext";
import { GroupSignals } from "../../../../../context/signalContext/lib/typeConstant";
import ImageSelection from "./lib/imageEffectsSelection/ImageSelection";
import SvgSelection from "./lib/svgEffectsSelection/SvgSelection";
import VideoSelection from "./lib/videoEffectsSelection/VideoSelection";
import TextSelection from "./lib/textEffectsSelection/TextSelection";
import "./lib/selectedSection.css";
import CameraSelection from "./lib/cameraEffectsSelection/CameraSelection";

export default function SelectedSection({
  tablePanelRef,
}: {
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { selected, addGroupSignalListener, removeGroupSignalListener } =
    useSignalContext();

  const [_, setRerender] = useState(false);

  const handleGroupSiganl = (signal: GroupSignals) => {
    if (signal.type === "groupChange") {
      setRerender((prev) => !prev);
    }
  };

  useEffect(() => {
    addGroupSignalListener(handleGroupSiganl);

    return () => {
      removeGroupSignalListener(handleGroupSiganl);
    };
  }, []);

  return (
    <div className="flex h-max w-full flex-col items-center justify-center space-y-2 py-2">
      {selected.current.map((sel) => {
        let media: React.ReactElement | null = null;
        switch (sel.type) {
          case "application":
            media = <></>;
            break;
          case "image":
            media = (
              <ImageSelection
                key={sel.id}
                contentId={sel.id}
                tablePanelRef={tablePanelRef}
              />
            );
            break;
          case "soundClip":
            media = <></>;
            break;
          case "svg":
            media = (
              <SvgSelection
                key={sel.id}
                contentId={sel.id}
                tablePanelRef={tablePanelRef}
              />
            );
            break;
          case "text":
            media = (
              <TextSelection
                key={sel.id}
                contentId={sel.id}
                tablePanelRef={tablePanelRef}
              />
            );
            break;
          case "video":
            media = (
              <VideoSelection
                key={sel.id}
                contentId={sel.id}
                tablePanelRef={tablePanelRef}
              />
            );
            break;
          case "camera":
            if (
              sel.username !== undefined &&
              sel.instance !== undefined &&
              sel.isUser !== undefined
            )
              media = (
                <CameraSelection
                  key={sel.id}
                  username={sel.username}
                  instance={sel.instance}
                  isUser={sel.isUser}
                  contentId={sel.id}
                  tablePanelRef={tablePanelRef}
                />
              );
            break;
          case "screen":
            media = <></>;
            break;
          case "audio":
            media = <></>;
            break;
          case "games":
            media = <></>;
            break;
          default:
            media = <></>;
            break;
        }

        return media;
      })}
    </div>
  );
}
