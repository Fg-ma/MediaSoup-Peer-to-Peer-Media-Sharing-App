import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import FgPanel from "../fgPanel/FgPanel";
import FgButton from "../fgButton/FgButton";
import "./lib/soundBoard.css";
import FgTriToggleButton from "../fgTriToggleButton/FgTriToggleButton";
import FgSoundBoardController from "./lib/FgSoundBoardController";
import {
  defaultSoundEffects,
  defaultSoundEffectsMetaData,
  SoundEffects,
  SoundEffectsMetaData,
} from "./lib/typeConstants";

export type BoardModes = "standard" | "crazy" | "seizure";

export default function FgSoundBoard({
  soundBoardButtonRef,
  closeCallback,
}: {
  soundBoardButtonRef?: HTMLButtonElement;
  closeCallback?: () => void;
}) {
  const [soundEffects, setSoundEffects] =
    useState<SoundEffects>(defaultSoundEffects);
  const soundEffectsMetaDataRef = useRef<SoundEffectsMetaData>(
    defaultSoundEffectsMetaData
  );

  const [boardMode, setBoardMode] = useState<BoardModes>("standard");
  const seizureBoardEffectIntevalRef = useRef<NodeJS.Timeout | undefined>(
    undefined
  );
  const seizureBoardEffectTimeoutRef = useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const [focus, setFocus] = useState(true);

  const fgSoundBoardController = new FgSoundBoardController(
    soundEffects,
    setSoundEffects,
    soundEffectsMetaDataRef,
    boardMode,
    setBoardMode,
    seizureBoardEffectIntevalRef,
    seizureBoardEffectTimeoutRef
  );

  return (
    <FgPanel
      content={
        <div className='flex flex-col w-full h-full'>
          <motion.div
            className='w-full min-h-10 h-10 z-[2] px-4 flex items-center'
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
          </motion.div>
          <div className='small-multidirectional-scroll-bar p-4 overflow-auto w-full grow relative'>
            <div className='w-full h-full min-h-max min-w-max grid grid-cols-5 gap-3 items-center justify-center justify-items-center place-items-center'>
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
      initHeight='434px'
      initWidth='395px'
      shadow={{ left: true, right: false, bottom: false, top: false }}
      closeCallback={closeCallback}
      closePosition='topRight'
      focusCallback={(newFocus: boolean) => setFocus(newFocus)}
    />
  );
}
