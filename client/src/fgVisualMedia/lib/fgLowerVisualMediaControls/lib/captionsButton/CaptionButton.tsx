import React, { useEffect, useRef, useState } from "react";
import { KaldiRecognizer, Model } from "vosk-browser";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import Captions from "./lib/Captions";
import CaptionsController from "./lib/CaptionsController";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";
import { Settings } from "../../../typeConstant";

import captionsIcon from "../../../../../../public/svgs/captionsIcon.svg";

const voskModels: { [model: string]: string } = {
  "ca-ES": "vosk-model-small-ca-0.4.tar.gz",
  "zh-CN": "vosk-model-small-cn-0.3.tar.gz",
  "de-DE": "vosk-model-small-de-0.15.tar.gz",
  "en-IN": "vosk-model-small-en-in-0.4.tar.gz",
  "en-US": "vosk-model-small-en-us-0.15.tar.gz",
  "es-ES": "vosk-model-small-es-0.3.tar.gz",
  Farsi: "vosk-model-small-fa-0.4.tar.gz",
  "fr-FR": "vosk-model-small-fr-pguyot-0.3.tar.gz",
  "it-IT": "vosk-model-small-it-0.4.tar.gz",
  "pt-PT": "vosk-model-small-pt-0.3.tar.gz",
  "ru-RU": "vosk-model-small-ru-0.4.tar.gz",
  "tr-TR": "vosk-model-small-tr-0.3.tar.gz",
  "vi-VN": "vosk-model-small-vn-0.3.tar.gz",
};

export default function CaptionButton({
  fgLowerVisualMediaController,
  visualEffectsActive,
  settingsActive,
  settings,
  audioStream,
  visualMediaContainerRef,
  scrollingContainerRef,
  containerRef,
}: {
  fgLowerVisualMediaController: FgLowerVisualMediaController;
  visualEffectsActive: boolean;
  settingsActive: boolean;
  settings: Settings;
  audioStream: MediaStream;
  visualMediaContainerRef: React.RefObject<HTMLDivElement>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [active, setActive] = useState(false);

  const [voskCaptions, setVoskCaptions] = useState<string>("");

  const voskRecognizer = useRef<KaldiRecognizer>();
  const [loadedVoskModel, setLoadedVoskModel] = useState<{
    model: Model;
    path: string;
  }>();

  const captionsController = new CaptionsController(
    loadedVoskModel,
    setLoadedVoskModel,
    voskRecognizer,
    setVoskCaptions
  );

  useEffect(() => {
    if (!audioStream || !voskRecognizer.current) {
      return;
    }

    captionsController.voskProcessAudioStream(audioStream);
  }, [audioStream, voskRecognizer.current]);

  useEffect(() => {
    if (!active) {
      return;
    }

    captionsController.loadVoskModel(voskModels[settings.closedCaption.value]);
  }, [settings.closedCaption.value]);

  return (
    <>
      <FgButton
        clickFunction={() => {
          if (!active) {
            captionsController.loadVoskModel(
              voskModels[settings.closedCaption.value]
            );
          }

          setActive((prev) => !prev);

          fgLowerVisualMediaController.handleClosedCaptions();

          fgLowerVisualMediaController.updateCaptionsStyles();
        }}
        contentFunction={() => {
          return (
            <>
              <FgSVG
                src={captionsIcon}
                attributes={[
                  { key: "width", value: "36px" },
                  { key: "height", value: "36px" },
                  { key: "fill", value: "white" },
                ]}
              />
              {active && <div className='caption-button-underline'></div>}
            </>
          );
        }}
        hoverContent={
          !visualEffectsActive && !settingsActive ? (
            <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Captions (c)
            </div>
          ) : undefined
        }
        scrollingContainerRef={scrollingContainerRef}
        className='caption-button flex-col items-center justify-center scale-x-[-1] pointer-events-auto'
      />
      {active && (
        <Captions
          visualMediaContainerRef={visualMediaContainerRef}
          voskCaptions={voskCaptions}
          containerRef={containerRef}
        />
      )}
    </>
  );
}
