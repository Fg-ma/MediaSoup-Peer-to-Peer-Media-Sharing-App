import React, { useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import { useCurrentEffectsStylesContext } from "../context/CurrentEffectsStylesContext";
import FgSVG from "../fgSVG/FgSVG";
import AudioEffectsSection from "./lib/AudioEffectsSection";
import AudioMixEffectsPortal from "./lib/AudioMixEffectsPortal";
import audioEffectIcon from "../../public/svgs/audioEffectIcon.svg";
import audioEffectOffIcon from "../../public/svgs/audioEffectOffIcon.svg";

export default function AudioEffectsButton() {
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const [effectSectionActive, setEffectSectionActive] = useState(false);
  const [audioMixEffectsActive, setAudioMixEffectsActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const audioMixEffectsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={buttonRef}
        clickFunction={async () => {
          setEffectSectionActive((prev) => !prev);
        }}
        contentFunction={() => {
          if (!currentEffectsStyles.current.audio) {
            return;
          }

          return (
            <FgSVG
              src={effectSectionActive ? audioEffectOffIcon : audioEffectIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
              ]}
            />
          );
        }}
        hoverContent={
          !effectSectionActive ? (
            <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Audio Effects
            </div>
          ) : (
            <></>
          )
        }
        className='flex items-center justify-center w-10 aspect-square'
      />
      {effectSectionActive && (
        <AudioEffectsSection
          type='below'
          buttonRef={buttonRef}
          audioMixEffectsActive={audioMixEffectsActive}
          setAudioMixEffectsActive={setAudioMixEffectsActive}
          audioMixEffectsButtonRef={audioMixEffectsButtonRef}
        />
      )}
      {audioMixEffectsActive && (
        <AudioMixEffectsPortal
          audioMixEffectsButtonRef={audioMixEffectsButtonRef}
        />
      )}
    </>
  );
}
