import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerTextController from "../LowerTextController";
import TableTextMediaInstance from "../../../../../media/fgTableText/TableTextMediaInstance";
import { useSocketContext } from "../../../../../context/socketContext/SocketContext";
import { IncomingLiveTextEditingMessages } from "../../../../../serverControllers/liveTextEditingServer/lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const saveIcon = nginxAssetServerBaseUrl + "svgs/saveIcon.svg";

export default function SaveSection({
  settingsActive,
  lowerTextController,
  scrollingContainerRef,
  textMediaInstance,
}: {
  settingsActive: boolean;
  lowerTextController: React.MutableRefObject<LowerTextController>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  textMediaInstance: TableTextMediaInstance;
}) {
  const { liveTextEditingSocket } = useSocketContext();

  const [_, setRerender] = useState(false);
  const savedVisible = useRef(false);
  const failedVisible = useRef(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const failedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMessage = (msg: IncomingLiveTextEditingMessages) => {
    switch (msg.type) {
      case "docSaved": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId === textMediaInstance.textMedia.textId &&
          instanceId === textMediaInstance.textInstanceId
        ) {
          textMediaInstance.saveState = "saved";
          savedVisible.current = true;

          if (savedTimeoutRef.current) {
            clearTimeout(savedTimeoutRef.current);
            savedTimeoutRef.current = undefined;
          }

          if (failedTimeoutRef.current) {
            clearTimeout(failedTimeoutRef.current);
            failedTimeoutRef.current = undefined;
          }

          savedTimeoutRef.current = setTimeout(() => {
            if (textMediaInstance.unsavedChanges) {
              textMediaInstance.saveState = "unsaved";
            }
            savedVisible.current = false;
            setRerender((prev) => !prev);

            if (savedTimeoutRef.current) {
              clearTimeout(savedTimeoutRef.current);
              savedTimeoutRef.current = undefined;
            }
          }, 3500);

          setRerender((prev) => !prev);
        }
        break;
      }
      case "docUpdated": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== textMediaInstance.textMedia.textId &&
          instanceId !== textMediaInstance.textInstanceId
        )
          return;

        if (failedTimeoutRef.current) {
          clearTimeout(failedTimeoutRef.current);
          failedTimeoutRef.current = undefined;
        }

        setRerender((prev) => !prev);
        break;
      }
      case "docSavedNewContent": {
        const { newContentId, instanceId } = msg.header;

        if (
          newContentId !== textMediaInstance.textMedia.textId &&
          instanceId !== textMediaInstance.textInstanceId
        )
          return;

        textMediaInstance.saveState = "saved";
        savedVisible.current = true;
        textMediaInstance.unsavedChanges = false;

        if (failedTimeoutRef.current) {
          clearTimeout(failedTimeoutRef.current);
          failedTimeoutRef.current = undefined;
        }

        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
          savedTimeoutRef.current = undefined;
        }

        savedTimeoutRef.current = setTimeout(() => {
          if (textMediaInstance.unsavedChanges) {
            textMediaInstance.saveState = "unsaved";
          }
          savedVisible.current = false;
          setRerender((prev) => !prev);

          if (savedTimeoutRef.current) {
            clearTimeout(savedTimeoutRef.current);
            savedTimeoutRef.current = undefined;
          }
        }, 3500);

        setRerender((prev) => !prev);
        break;
      }
      case "docSavedFail": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== textMediaInstance.textMedia.textId &&
          instanceId !== textMediaInstance.textInstanceId
        )
          return;

        failedVisible.current = true;

        if (failedTimeoutRef.current) {
          clearTimeout(failedTimeoutRef.current);
          failedTimeoutRef.current = undefined;
        }

        failedTimeoutRef.current = setTimeout(() => {
          failedVisible.current = false;

          if (failedTimeoutRef.current) {
            clearTimeout(failedTimeoutRef.current);
            failedTimeoutRef.current = undefined;
          }
        });

        setRerender((prev) => !prev);
        break;
      }
      case "savedOps": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== textMediaInstance.textMedia.textId &&
          instanceId !== textMediaInstance.textInstanceId
        )
          return;

        textMediaInstance.saveState = "saving";
        textMediaInstance.unsavedChanges = false;

        setRerender((prev) => !prev);
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    liveTextEditingSocket.current?.addMessageListener(handleMessage);

    return () => {
      liveTextEditingSocket.current?.removeMessageListener(handleMessage);
    };
  }, []);

  return (
    <div className="flex h-full items-center justify-center space-x-2">
      {(textMediaInstance.saveState !== "saved" ||
        textMediaInstance.unsavedChanges) &&
        textMediaInstance.saveState !== "saving" && (
          <FgButton
            clickFunction={() => {
              textMediaInstance.saveState = "saving";
              textMediaInstance.unsavedChanges = false;
              lowerTextController.current.handleSave();
              setRerender((prev) => !prev);
            }}
            contentFunction={() => (
              <FgSVGElement
                src={saveIcon}
                attributes={[
                  { key: "width", value: "85%" },
                  { key: "height", value: "85%" },
                  { key: "fill", value: "#f2f2f2" },
                  { key: "stroke", value: "#f2f2f2" },
                ]}
              />
            )}
            hoverContent={
              !settingsActive ? (
                <FgHoverContentStandard content="Save (ctrl+s)" style="light" />
              ) : undefined
            }
            scrollingContainerRef={scrollingContainerRef}
            className="pointer-events-auto flex aspect-square h-full scale-x-[-1] items-center justify-center"
          />
        )}
      {(textMediaInstance.saveState === "saving" ||
        (textMediaInstance.saveState === "saved" && savedVisible.current) ||
        (textMediaInstance.saveState === "failed" &&
          failedVisible.current)) && (
        <div className="select-none font-K2D text-lg text-fg-white">
          {textMediaInstance.saveState === "saving"
            ? "Saving..."
            : textMediaInstance.saveState === "saved"
              ? "Saved"
              : textMediaInstance.saveState === "failed"
                ? "Save failed"
                : null}
        </div>
      )}
    </div>
  );
}
