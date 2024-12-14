import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import FgPanel from "../fgElements/fgPanel/FgPanel";
import FgButton from "../fgElements/fgButton/FgButton";
import "./lib/soundBoard.css";
import FgSoundBoardController from "./lib/FgSoundBoardController";
import {
  BoardModes,
  defaultImportButton,
  defaultSoundEffects,
  defaultSoundEffectsMetaData,
  SoundEffects,
  SoundEffectsMetaData,
} from "./lib/typeConstant";
import FgSVG from "../fgElements/fgSVG/FgSVG";
import FgTriToggleButton from "../fgElements/fgTriToggleButton/FgTriToggleButton";

import additionIcon from "../../public/svgs/additionIcon.svg";

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
    defaultSoundEffectsMetaData
  );
  const [importButton, setImportButton] = useState<{
    pressed: boolean;
    seizureColor: string | undefined;
    classes: string[];
  }>(defaultImportButton);

  const [boardMode, setBoardMode] = useState<BoardModes>("standard");
  const seizureBoardEffectIntevalRef = useRef<NodeJS.Timeout | undefined>(
    undefined
  );
  const seizureBoardEffectTimeoutRef = useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const [focus, setFocus] = useState(true);

  const fileSelectorRef = useRef<HTMLInputElement>(null);

  const [importedFiles, setImportedFiles] = useState<
    Record<number, { file: File; path: string }>
  >({});

  const tempImportedFiles = useRef<FileList | undefined>(undefined);

  const audioEndTimeouts = useRef<Record<number, NodeJS.Timeout | undefined>>(
    {}
  );

  const fgSoundBoardController = new FgSoundBoardController(
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
    audioEndTimeouts
  );

  useEffect(() => {
    if (tempImportedFiles.current === undefined) {
      setSoundEffects((prevEffects) => {
        const newEffects = { ...prevEffects };

        for (const key in newEffects) {
          const updatedClasses = [...newEffects[key].classes];

          newEffects[key].classes = updatedClasses.filter(
            (cls) => cls !== "assignment"
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
        <div className='flex flex-col w-full h-full'>
          <input
            ref={fileSelectorRef}
            className='hidden'
            type='file'
            onChange={fgSoundBoardController.handleFileInput}
            multiple
          />
          <motion.div
            className='w-full min-h-10 h-10 z-[2] px-4 flex items-center justify-between'
            style={{
              // prettier-ignore
              boxShadow: `0px 10px 5px -5px ${focus ? "#ffffff" : "#f3f3f3"}`,
            }}
            transition={{
              boxShadow: { duration: 0.3, ease: "linear" },
            }}
          >
            <div className='w-24 h-8'>
              <FgTriToggleButton
                kind='cycle'
                initPosition={0}
                stateChangeFunction={fgSoundBoardController.stateChangeFunction}
                btnLabels={["Standard", "Crazy", "Seizure"]}
              />
            </div>
            <div className='select-none font-K2D text-xl truncate'>
              {tempImportedFiles.current &&
                tempImportedFiles.current[0] &&
                tempImportedFiles.current[0].name}
            </div>
          </motion.div>
          <div className='small-multidirectional-scroll-bar p-4 overflow-auto w-full grow relative'>
            <div className='w-full h-full min-h-max min-w-max grid grid-cols-5 gap-3 items-center justify-center justify-items-center place-items-center'>
              <FgButton
                className={`sound-board-btn ${
                  importButton.pressed ? "pressed" : ""
                } ${importButton.classes.join(" ")}`}
                mouseDownFunction={
                  fgSoundBoardController.handleImportEffectClickDown
                }
                mouseUpFunction={
                  fgSoundBoardController.handleImportEffectClickUp
                }
                touchStartFunction={
                  fgSoundBoardController.handleImportEffectClickDown
                }
                touchEndFunction={
                  fgSoundBoardController.handleImportEffectClickUp
                }
                contentFunction={() => (
                  <>
                    <div className='sound-board-btn-alt-1'>
                      <FgSVG
                        src={additionIcon}
                        attributes={[
                          { key: "width", value: "90%" },
                          { key: "height", value: "90%" },
                          {
                            key: "fill",
                            value: importButton.pressed ? "#f57e41" : "#cccccc",
                          },
                          {
                            key: "stroke",
                            value: importButton.pressed ? "#f57e41" : "#cccccc",
                          },
                        ]}
                        className='w-full h-full flex items-center justify-center z-[2]'
                      />
                    </div>
                    <div className='sound-board-btn-alt-2'></div>
                    <div className='sound-board-btn-alt-3'></div>
                  </>
                )}
              />
              {Object.entries(soundEffects).map(([key, effect]) => (
                <FgButton
                  key={key}
                  className={`sound-board-btn ${
                    effect.pressed ? "pressed" : ""
                  } ${effect.classes.join(" ")}`}
                  mouseDownFunction={() =>
                    fgSoundBoardController.clickDown(parseInt(key))
                  }
                  mouseUpFunction={() =>
                    fgSoundBoardController.clickUp(parseInt(key))
                  }
                  touchStartFunction={() =>
                    fgSoundBoardController.clickDown(parseInt(key))
                  }
                  touchEndFunction={() =>
                    fgSoundBoardController.clickUp(parseInt(key))
                  }
                  contentFunction={() => (
                    <>
                      <div className='sound-board-btn-alt-1'></div>
                      <div className='sound-board-btn-alt-2'></div>
                      <div className='sound-board-btn-alt-3'></div>
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
      initHeight='645px'
      initWidth='605px'
      shadow={{ left: true, right: false, bottom: false, top: false }}
      closeCallback={() => {
        fgSoundBoardController.closeSoundBoard();
        if (closeCallback) {
          closeCallback();
        }
      }}
      closePosition='topRight'
      focusCallback={(newFocus: boolean) => setFocus(newFocus)}
    />
  );
}
