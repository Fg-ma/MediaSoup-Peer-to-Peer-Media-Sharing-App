import React, { useEffect, useRef, useState } from "react";
import { KaldiRecognizer, Model } from "vosk-browser";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import Captions from "./lib/Captions";
import CaptionsController from "./lib/CaptionsController";
import LowerVideoController from "../LowerVideoController";
import { Settings } from "../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const captionsIcon = nginxAssetServerBaseUrl + "svgs/captionsIcon.svg";

const voskModels: { [model: string]: string } = {
  ar: "vosk-model-ar-mgb2-0.4.zip",
  "ar-TN": "vosk-model-small-ar-tn-0.1-linto.zip",
  br: "vosk-model-br-0.8.zip",
  "ca-ES": "vosk-model-small-ca-0.4.tar.gz",
  "zh-CN": "vosk-model-small-cn-0.3.tar.gz",
  cs: "vosk-model-small-cs-0.4-rhasspy.zip",
  "de-DE": "vosk-model-small-de-0.15.tar.gz",
  "en-IN": "vosk-model-small-en-in-0.4.tar.gz",
  "en-US": "vosk-model-small-en-us-0.15.tar.gz", //"vosk-model-en-us-0.22-lgraph.zip",
  eo: "vosk-model-small-eo-0.42.zip",
  "es-ES": "vosk-model-small-es-0.3.tar.gz",
  fa: "vosk-model-small-fa-0.5.zip",
  "fr-FR": "vosk-model-small-fr-0.22.zip",
  gu: "vosk-model-small-gu-0.42.zip",
  hi: "vosk-model-small-hi-0.22.zip",
  "it-IT": "vosk-model-small-it-0.4.tar.gz",
  ja: "vosk-model-small-ja-0.22.zip",
  ko: "vosk-model-small-ko-0.22.zip",
  kz: "vosk-model-small-kz-0.15.zip",
  nl: "vosk-model-small-nl-0.22.zip",
  pl: "vosk-model-small-pl-0.22.zip",
  "pt-PT": "vosk-model-small-pt-0.3.tar.gz",
  "ru-RU": "vosk-model-small-ru-0.4.tar.gz",
  sv: "vosk-model-small-sv-rhasspy-0.15.zip",
  tg: "vosk-model-small-tg-0.22.zip",
  "tr-TR": "vosk-model-small-tr-0.3.tar.gz",
  uk: "vosk-model-small-uk-v3-nano.zip",
  uz: "vosk-model-small-uz-0.22.zip",
  "vi-VN": "vosk-model-small-vn-0.3.tar.gz",
};

export default function CaptionButton({
  lowerVideoController,
  videoEffectsActive,
  settingsActive,
  settings,
  audioStream,
  videoContainerRef,
  scrollingContainerRef,
  containerRef,
}: {
  lowerVideoController: React.MutableRefObject<LowerVideoController>;
  videoEffectsActive: boolean;
  settingsActive: boolean;
  settings: Settings;
  audioStream: MediaStream;
  videoContainerRef: React.RefObject<HTMLDivElement>;
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

  const captionsController = useRef(
    new CaptionsController(
      loadedVoskModel,
      setLoadedVoskModel,
      voskRecognizer,
      setVoskCaptions,
    ),
  );

  useEffect(() => {
    if (!audioStream || !voskRecognizer.current) {
      return;
    }

    captionsController.current.voskProcessAudioStream(audioStream);
  }, [audioStream, voskRecognizer.current]);

  useEffect(() => {
    if (!active) {
      return;
    }

    captionsController.current.loadVoskModel(
      voskModels[settings.closedCaption.value],
    );
  }, [settings.closedCaption.value]);

  return (
    <>
      <FgButton
        clickFunction={() => {
          if (!active) {
            captionsController.current.loadVoskModel(
              voskModels[settings.closedCaption.value],
            );
          }

          setActive((prev) => !prev);

          lowerVideoController.current.handleClosedCaptions();

          lowerVideoController.current.updateCaptionsStyles();
        }}
        contentFunction={() => {
          return (
            <>
              <FgSVGElement
                src={captionsIcon}
                className="flex items-center justify-center"
                attributes={[
                  { key: "width", value: "85%" },
                  { key: "height", value: "85%" },
                  { key: "fill", value: "#f2f2f2" },
                ]}
              />
              {active && <div className="caption-button-underline"></div>}
            </>
          );
        }}
        hoverContent={
          !videoEffectsActive && !settingsActive ? (
            <FgHoverContentStandard content="Captions (c)" style="light" />
          ) : undefined
        }
        scrollingContainerRef={scrollingContainerRef}
        className="pointer-events-auto aspect-square h-full scale-x-[-1] flex-col items-center justify-center"
      />
      {active && (
        <Captions
          videoContainerRef={videoContainerRef}
          voskCaptions={voskCaptions}
          containerRef={containerRef}
        />
      )}
    </>
  );
}
