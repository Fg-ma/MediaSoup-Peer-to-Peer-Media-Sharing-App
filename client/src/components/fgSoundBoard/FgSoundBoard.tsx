import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import FgPanel from "../../elements/fgPanel/FgPanel";
import FgButton from "../../elements/fgButton/FgButton";
import FgSoundBoardController from "./lib/FgSoundBoardController";
import {
  BoardModes,
  defaultImportButton,
  defaultSoundEffects,
  defaultSoundEffectsMetaData,
  SoundEffects,
  SoundEffectsMetaData,
} from "./lib/typeConstant";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import FgTriToggleButton from "../../elements/fgTriToggleButton/FgTriToggleButton";
import "./lib/soundBoard.css";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";

export default function FgSoundBoard({
  soundBoardButtonRef,
  closeCallback,
}: {
  soundBoardButtonRef?: HTMLButtonElement;
  closeCallback?: () => void;
}) {
  const { userMedia } = useMediaContext();

  const [soundEffects, setSoundEffects] =
    useState<SoundEffects>(defaultSoundEffects);
  const soundEffectsMetaDataRef = useRef<SoundEffectsMetaData>(
    defaultSoundEffectsMetaData,
  );
  const [importButton, setImportButton] = useState<{
    pressed: boolean;
    seizureColor: string | undefined;
    classes: string[];
  }>(defaultImportButton);

  const [boardMode, setBoardMode] = useState<BoardModes>("standard");
  const seizureBoardEffectIntevalRef = useRef<NodeJS.Timeout | undefined>(
    undefined,
  );
  const seizureBoardEffectTimeoutRef = useRef<NodeJS.Timeout | undefined>(
    undefined,
  );

  const [focus, setFocus] = useState(true);

  const fileSelectorRef = useRef<HTMLInputElement>(null);

  const [importedFiles, setImportedFiles] = useState<
    Record<number, { file: File; path: string }>
  >({});

  const tempImportedFiles = useRef<FileList | undefined>(undefined);

  const audioEndTimeouts = useRef<Record<number, NodeJS.Timeout | undefined>>(
    {},
  );

  const fgSoundBoardController = useRef(
    new FgSoundBoardController(
      soundEffects,
      setSoundEffects,
      soundEffectsMetaDataRef,
      boardMode,
      setBoardMode,
      seizureBoardEffectIntevalRef,
      seizureBoardEffectTimeoutRef,
      importButton,
      setImportButton,
      fileSelectorRef,
      importedFiles,
      setImportedFiles,
      tempImportedFiles,
      userMedia,
      audioEndTimeouts,
    ),
  );

  useEffect(() => {
    if (tempImportedFiles.current === undefined) {
      setSoundEffects((prevEffects) => {
        const newEffects = { ...prevEffects };

        for (const key in newEffects) {
          const updatedClasses = [...newEffects[key].classes];

          newEffects[key].classes = updatedClasses.filter(
            (cls) => cls !== "assignment",
          );
        }

        return newEffects;
      });
    } else {
      setSoundEffects((prevEffects) => {
        const newEffects = { ...prevEffects };

        for (const key in newEffects) {
          const updatedClasses = [...newEffects[key].classes];

          if (!updatedClasses.includes("assignment")) {
            updatedClasses.push("assignment");
            newEffects[key].classes = updatedClasses;
          }
        }

        return newEffects;
      });
    }
  }, [tempImportedFiles.current]);

  return (
    <FgPanel
      content={
        <div className="flex h-full w-full flex-col">
          <input
            ref={fileSelectorRef}
            className="hidden"
            type="file"
            onChange={fgSoundBoardController.current.handleFileInput}
            multiple
          />
          <motion.div
            className="z-[2] flex h-10 min-h-10 w-full items-center justify-between px-4"
            style={{
              // prettier-ignore
              boxShadow: `0px 10px 5px -5px ${focus ? "#161616" : "#212121"}`,
            }}
            transition={{
              boxShadow: {
                duration: 0.3,
                ease: "linear",
              },
            }}
          >
            <div className="h-8 w-24">
              <FgTriToggleButton
                kind="cycle"
                initPosition={0}
                stateChangeFunction={
                  fgSoundBoardController.current.stateChangeFunction
                }
                btnLabels={["Standard", "Crazy", "Seizure"]}
              />
            </div>
            {(boardMode === "crazy" || boardMode === "seizure") && (
              <div className="w-max select-none truncate font-K2D text-xl text-fg-off-white">
                {boardMode === "crazy" ? "Crazy mode" : "Seizure mode"}
              </div>
            )}
            <div className="select-none truncate font-K2D text-xl text-fg-off-white">
              {tempImportedFiles.current &&
                tempImportedFiles.current[0] &&
                tempImportedFiles.current[0].name}
            </div>
          </motion.div>
          <div className="small-multidirectional-scroll-bar relative w-full grow overflow-auto p-4">
            <div className="grid h-full min-h-max w-full min-w-max grid-cols-5 place-items-center items-center justify-center justify-items-center gap-3">
              <FgButton
                className={`sound-board-btn ${
                  importButton.pressed ? "pressed" : ""
                } ${importButton.classes.join(" ")}`}
                pointerDownFunction={
                  fgSoundBoardController.current.handleImportEffectClickDown
                }
                pointerUpFunction={
                  fgSoundBoardController.current.handleImportEffectClickUp
                }
                contentFunction={() => (
                  <>
                    <div className="sound-board-btn-alt-1">
                      <FgSVGElement
                        src={additionIcon}
                        attributes={[
                          { key: "width", value: "90%" },
                          { key: "height", value: "90%" },
                          {
                            key: "fill",
                            value: importButton.pressed ? "#e80110" : "#cccccc",
                          },
                          {
                            key: "stroke",
                            value: importButton.pressed ? "#e80110" : "#cccccc",
                          },
                        ]}
                        className="z-[2] flex h-full w-full items-center justify-center"
                      />
                    </div>
                    <div className="sound-board-btn-alt-2"></div>
                    <div className="sound-board-btn-alt-3"></div>
                  </>
                )}
              />
              {Object.entries(soundEffects).map(([key, effect]) => (
                <FgButton
                  key={key}
                  className={`sound-board-btn ${
                    effect.pressed ? "pressed" : ""
                  } ${effect.classes.join(" ")}`}
                  pointerDownFunction={() =>
                    fgSoundBoardController.current.clickDown(parseInt(key))
                  }
                  pointerUpFunction={() =>
                    fgSoundBoardController.current.clickUp(parseInt(key))
                  }
                  contentFunction={() => (
                    <>
                      <div className="sound-board-btn-alt-1"></div>
                      <div className="sound-board-btn-alt-2"></div>
                      <div className="sound-board-btn-alt-3"></div>
                    </>
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      }
      minHeight={434}
      minWidth={395}
      initPosition={{
        x: 0,
        y: 0,
        referenceElement: soundBoardButtonRef,
        placement: "below",
      }}
      initHeight="645px"
      initWidth="605px"
      shadow={{ left: true, right: false, bottom: false, top: false }}
      closeCallback={() => {
        fgSoundBoardController.current.closeSoundBoard();

        if (closeCallback) {
          closeCallback();
        }
      }}
      closePosition="topRight"
      focusCallback={(newFocus: boolean) => setFocus(newFocus)}
      backgroundColor={"#161616"}
      secondaryBackgroundColor={"#212121"}
    />
  );
}
