import React, { useEffect, useRef, useState } from "react";
import { KaldiRecognizer, Model } from "vosk-browser";
import Controls from "./Controls";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import { Settings } from "../../fgVideo/FgVideo";
import FgVideoCaptions from "./FgVideoCaptions";
import CaptionsFunctions from "./captionsFunctions";

import captionsIcon from "../../../public/svgs/captionsIcon.svg";

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

export type browserLangs =
  | "af-ZA"
  | "am-ET"
  | "ar-SA"
  | "az-AZ"
  | "bg-BG"
  | "bn-BD"
  | "bn-IN"
  | "ca-ES"
  | "cs-CZ"
  | "da-DK"
  | "de-DE"
  | "el-GR"
  | "en-AU"
  | "en-CA"
  | "en-GB"
  | "en-IN"
  | "en-NZ"
  | "en-US"
  | "es-AR"
  | "es-BO"
  | "es-CL"
  | "es-CO"
  | "es-CR"
  | "es-DO"
  | "es-EC"
  | "es-ES"
  | "es-GT"
  | "es-HN"
  | "es-MX"
  | "es-NI"
  | "es-PA"
  | "es-PE"
  | "es-PR"
  | "es-PY"
  | "es-SV"
  | "es-US"
  | "es-UY"
  | "es-VE"
  | "et-EE"
  | "eu-ES"
  | "fa-IR"
  | "fi-FI"
  | "fil-PH"
  | "fr-BE"
  | "fr-CA"
  | "fr-CH"
  | "fr-FR"
  | "gl-ES"
  | "gu-IN"
  | "he-IL"
  | "hi-IN"
  | "hr-HR"
  | "hu-HU"
  | "hy-AM"
  | "id-ID"
  | "is-IS"
  | "it-IT"
  | "ja-JP"
  | "jv-ID"
  | "ka-GE"
  | "kk-KZ"
  | "km-KH"
  | "kn-IN"
  | "ko-KR"
  | "lo-LA"
  | "lt-LT"
  | "lv-LV"
  | "ml-IN"
  | "mn-MN"
  | "mr-IN"
  | "ms-MY"
  | "my-MM"
  | "ne-NP"
  | "nl-BE"
  | "nl-NL"
  | "no-NO"
  | "pl-PL"
  | "pt-BR"
  | "pt-PT"
  | "ro-RO"
  | "ru-RU"
  | "si-LK"
  | "sk-SK"
  | "sl-SI"
  | "sq-AL"
  | "sr-RS"
  | "su-ID"
  | "sv-SE"
  | "sw-KE"
  | "ta-IN"
  | "ta-LK"
  | "te-IN"
  | "th-TH"
  | "tr-TR"
  | "uk-UA"
  | "ur-IN"
  | "ur-PK"
  | "uz-UZ"
  | "vi-VN"
  | "zh-CN"
  | "zh-HK"
  | "zh-TW"
  | "zu-ZA"
  | "Farsi";

export interface VoskResult {
  event: string;
  recognizerId: string;
  result: {
    result: {
      conf: number;
      start: number;
      end: number;
      word: string;
    }[];
    text: string;
  };
}

export default function CaptionButton({
  controls,
  effectsActive,
  settingsActive,
  settings,
  audioStream,
  videoContainerRef,
  browserStandardSpeechRecognitionAvailable,
}: {
  controls: Controls;
  effectsActive: boolean;
  settingsActive: boolean;
  settings: Settings;
  audioStream: MediaStream;
  videoContainerRef: React.RefObject<HTMLDivElement>;
  browserStandardSpeechRecognitionAvailable: React.MutableRefObject<boolean>;
}) {
  const [active, setActive] = useState(false);

  const [browserCaptions, setBrowserCaptions] = useState("");
  const [voskCaptions, setVoskCaptions] = useState<VoskResult>();

  const [browserLang, setBrowserLang] = useState<browserLangs>("en-US");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const browserRecognizer = useRef<any>();

  const voskRecognizer = useRef<KaldiRecognizer>();
  const [loadedVoskModel, setLoadedVoskModel] = useState<{
    model: Model;
    path: string;
  }>();

  const captionsFunctions = new CaptionsFunctions(
    loadedVoskModel,
    setLoadedVoskModel,
    voskRecognizer,
    browserRecognizer,
    browserLang,
    setBrowserCaptions,
    setVoskCaptions,
    browserStandardSpeechRecognitionAvailable
  );

  useEffect(() => {
    if (audioStream && !browserStandardSpeechRecognitionAvailable.current) {
      captionsFunctions.voskProcessAudioStream(audioStream);
    }
  }, [audioStream, voskRecognizer]);

  useEffect(() => {
    if (browserStandardSpeechRecognitionAvailable.current) {
      browserRecognizer.current.stop();

      setBrowserLang(settings.closedCaption.value);
      browserRecognizer.current.lang = settings.closedCaption.value;

      if (active) {
        browserRecognizer.current.start();
      }
    } else {
      captionsFunctions.loadVoskModel(voskModels[settings.closedCaption.value]);
    }
  }, [settings.closedCaption.value]);

  return (
    <>
      <FgButton
        clickFunction={() => {
          if (!active) {
            if (browserStandardSpeechRecognitionAvailable.current) {
              setBrowserLang(settings.closedCaption.value);
              browserRecognizer.current.start();
            } else {
              captionsFunctions.loadVoskModel(
                voskModels[settings.closedCaption.value]
              );
            }
          } else {
            if (browserStandardSpeechRecognitionAvailable.current) {
              browserRecognizer.current.stop();
            }
          }

          setActive((prev) => !prev);

          controls.handleClosedCaptions();

          controls.updateCaptionsStyles();
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
          !effectsActive && !settingsActive ? (
            <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Captions (c)
            </div>
          ) : undefined
        }
        className='caption-button flex-col items-center justify-center scale-x-[-1] pointer-events-auto'
      />
      {active && (
        <FgVideoCaptions
          videoContainerRef={videoContainerRef}
          browserStandardSpeechRecognitionAvailable={
            browserStandardSpeechRecognitionAvailable
          }
          voskCaptions={voskCaptions}
          browserCaptions={browserCaptions}
        />
      )}
    </>
  );
}
