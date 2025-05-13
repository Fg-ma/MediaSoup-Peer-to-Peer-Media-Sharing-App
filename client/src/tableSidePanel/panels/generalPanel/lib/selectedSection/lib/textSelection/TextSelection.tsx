import React, { useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import GeneralMediaSelection from "../GeneralMediaSelection";
import EditableText from "../../../../../../../media/fgTableText/lib/EditableText";
import {
  defaultSettings,
  Settings,
} from "../../../../../../../media/fgTableText/lib/typeConstant";

export default function TextSelection({
  contentId,
  tablePanelRef,
}: {
  contentId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const textInstanceMedia = userMedia.current.text.tableInstances[contentId];
  const positioning = textInstanceMedia?.getPositioning();

  const text = useRef(textInstanceMedia.instanceText ?? "");

  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings),
  );

  const [isEditing, setIsEditing] = useState(false);
  const textAreaContainerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLPreElement>(null);

  const expandLineNumbersButtonRef = useRef<HTMLButtonElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  return (
    textInstanceMedia && (
      <GeneralMediaSelection
        contentId={contentId}
        contentType="text"
        selectionContentStyle={{ width: "calc(100% - 1rem)" }}
        selectionContent={
          <EditableText
            className="!h-48 !w-full overflow-hidden rounded"
            text={text}
            settings={settings}
            expandLineNumbersButtonRef={expandLineNumbersButtonRef}
            lineNumbersRef={lineNumbersRef}
            textAreaRef={textAreaRef}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            textAreaContainerRef={textAreaContainerRef}
          />
        }
        downloadFunction={textInstanceMedia.textMedia.downloadText}
        filename={textInstanceMedia.textMedia.filename}
        mimeType={textInstanceMedia.textMedia.mimeType}
        fileSize={textInstanceMedia.textMedia.getFileSize()}
        tablePanelRef={tablePanelRef}
        positioning={positioning}
        options={{ downloadType: "button" }}
      />
    )
  );
}
