import React, { useEffect, useState } from "react";
import { useSignalContext } from "../../../../../context/signalContext/SignalContext";
import { GroupSignals } from "../../../../../context/signalContext/lib/typeConstant";
import ImageSelection from "./lib/imageSelection/ImageSelection";
import SvgSelection from "./lib/svgSelection/SvgSelection";
import VideoSelection from "./lib/videoSelection/VideoSelection";
import TextSelection from "./lib/textSelection/TextSelection";
import VisualMediaSelection from "./lib/visualMediaSelection/VisualMediaSelection";
import "./lib/selectedSection.css";

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
                instanceId={sel.id}
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
                instanceId={sel.id}
                tablePanelRef={tablePanelRef}
              />
            );
            break;
          case "text":
            media = (
              <TextSelection
                key={sel.id}
                instanceId={sel.id}
                tablePanelRef={tablePanelRef}
              />
            );
            break;
          case "video":
            media = (
              <VideoSelection
                key={sel.id}
                instanceId={sel.id}
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
                <VisualMediaSelection
                  key={sel.id}
                  username={sel.username}
                  instance={sel.instance}
                  isUser={sel.isUser}
                  instanceId={sel.id}
                  type="camera"
                  tablePanelRef={tablePanelRef}
                />
              );
            break;
          case "screen":
            if (
              sel.username !== undefined &&
              sel.instance !== undefined &&
              sel.isUser !== undefined
            )
              media = (
                <VisualMediaSelection
                  key={sel.id}
                  username={sel.username}
                  instance={sel.instance}
                  isUser={sel.isUser}
                  instanceId={sel.id}
                  type="screen"
                  tablePanelRef={tablePanelRef}
                />
              );
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
