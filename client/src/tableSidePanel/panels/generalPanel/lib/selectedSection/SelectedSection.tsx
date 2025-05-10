import React, { useEffect, useState } from "react";
import { useSignalContext } from "../../../../../context/signalContext/SignalContext";
import { GroupSignals } from "../../../../../context/signalContext/lib/typeConstant";
import ImageSelection from "./lib/ImageSelection";
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
    <div className="h-max w-full py-2">
      {selected.current.map((sel) => {
        let media: React.ReactElement;
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
            media = <></>;
            break;
          case "text":
            media = <></>;
            break;
          case "video":
            media = <></>;
            break;
          case "camera":
            media = <></>;
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
