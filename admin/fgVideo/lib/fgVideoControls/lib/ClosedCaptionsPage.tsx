import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import { ActivePages } from "../FgVideoControls";
import { Settings } from "../../fgVideo/FgVideo";

import navigateBackIcon from "../../../public/svgs/navigateBack.svg";

export const closedCaptionsSelections = {
  "ca-ES": "Catalan",
  "zh-CN": "Chinese (China)",
  "en-IN": "English (India)",
  "en-US": "English (US)",
  "fr-FR": "French",
  "de-DE": "German",
  "it-IT": "Italian",
  "pt-PT": "Portuguese",
  "ru-RU": "Russian",
  "es-ES": "Spanish (Spain)",
  "tr-TR": "Turkish",
  "vi-VN": "Vietnamese",
};

export const expandedClosedCaptionsVoskSelections = {
  Farsi: "Farsi",
};

export const expandedClosedCaptionsBrowserSelections = {
  "af-ZA": "Afrikaans",
  "sq-AL": "Albanian",
  "am-ET": "Amharic",
  "ar-SA": "Arabic",
  "hy-AM": "Armenian",
  "az-AZ": "Azerbaijani",
  "eu-ES": "Basque",
  "bg-BG": "Bulgarian",
  "bn-BD": "Bengali (BD)",
  "bn-IN": "Bengali (India)",
  "my-MM": "Burmese",
  "zh-HK": "Chinese (HK)",
  "zh-TW": "Chinese (Taiwan)",
  "cs-CZ": "Czech",
  "hr-HR": "Croatian",
  "da-DK": "Danish",
  "nl-BE": "Dutch (Belgium)",
  "nl-NL": "Dutch (NL)",
  "en-AU": "English (Australia)",
  "en-CA": "English (Canada)",
  "en-GB": "English (UK)",
  "en-NZ": "English (NZ)",
  "et-EE": "Estonian",
  "fi-FI": "Finnish",
  "fil-PH": "Filipino",
  "fr-BE": "French (Belgium)",
  "fr-CA": "French (Canada)",
  "fr-CH": "French (Swiss)",
  "gl-ES": "Galician",
  "ka-GE": "Georgian",
  "el-GR": "Greek",
  "gu-IN": "Gujarati",
  "he-IL": "Hebrew",
  "hi-IN": "Hindi",
  "hu-HU": "Hungarian",
  "is-IS": "Icelandic",
  "id-ID": "Indonesian",
  "ja-JP": "Japanese",
  "jv-ID": "Javanese",
  "kn-IN": "Kannada",
  "kk-KZ": "Kazakh",
  "km-KH": "Khmer",
  "ko-KR": "Korean",
  "lo-LA": "Lao",
  "lv-LV": "Latvian",
  "lt-LT": "Lithuanian",
  "ms-MY": "Malay",
  "ml-IN": "Malayalam",
  "mr-IN": "Marathi",
  "mn-MN": "Mongolian",
  "ne-NP": "Nepali",
  "no-NO": "Norwegian",
  "fa-IR": "Persian",
  "pl-PL": "Polish",
  "pt-BR": "Portuguese",
  "ro-RO": "Romanian",
  "sr-RS": "Serbian",
  "si-LK": "Sinhala",
  "sk-SK": "Slovak",
  "sl-SI": "Slovenian",
  "es-AR": "Spanish (AR)",
  "es-BO": "Spanish (Bolivia)",
  "es-CL": "Spanish (Chile)",
  "es-CO": "Spanish (CO)",
  "es-CR": "Spanish (CR)",
  "es-DO": "Spanish (DR)",
  "es-EC": "Spanish (Ecuador)",
  "es-SV": "Spanish (SV)",
  "es-GT": "Spanish (GT)",
  "es-HN": "Spanish (HN)",
  "es-MX": "Spanish (Mexico)",
  "es-NI": "Spanish (NI)",
  "es-PA": "Spanish (Panama)",
  "es-PE": "Spanish (Peru)",
  "es-PR": "Spanish (PR)",
  "es-PY": "Spanish (PY)",
  "es-US": "Spanish (US)",
  "es-UY": "Spanish (UY)",
  "es-VE": "Spanish (VE)",
  "su-ID": "Sundanese",
  "sw-KE": "Swahili",
  "sv-SE": "Swedish",
  "ta-IN": "Tamil (India)",
  "ta-LK": "Tamil (Sri Lanka)",
  "te-IN": "Telugu",
  "th-TH": "Thai",
  "uk-UA": "Ukrainian",
  "ur-IN": "Urdu (India)",
  "ur-PK": "Urdu (Pakistan)",
  "uz-UZ": "Uzbek",
  "zu-ZA": "Zulu",
};

export default function ClosedCaptionsPage({
  setActivePages,
  settings,
  setSettings,
  browserStandardSpeechRecognitionAvailable,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  browserStandardSpeechRecognitionAvailable: React.MutableRefObject<boolean>;
}) {
  const [moreActive, setMoreActive] = useState(false);

  const setClosedCaptionsLang = (
    newLang: keyof typeof closedCaptionsSelections
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.closedCaption.value = newLang;

      return newSettings;
    });
  };

  const handleCloseClosedCaptionPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.active =
        !newActivePages.closedCaption.active;

      return newActivePages;
    });
  };

  const handleClosedCaptionOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.closedCaptionOptionsActive.active =
        !newActivePages.closedCaption.closedCaptionOptionsActive.active;

      return newActivePages;
    });
  };

  return (
    <div className='w-full h-full flex flex-col justify-center items-center space-y-2'>
      <div className='h-6 w-full flex justify-between'>
        <div className='w-full flex space-x-1'>
          <FgButton
            className='h-full aspect-square'
            contentFunction={() => (
              <FgSVG
                src={navigateBackIcon}
                attributes={[
                  { key: "width", value: "95%" },
                  { key: "height", value: "95%" },
                  { key: "fill", value: "white" },
                  { key: "stroke", value: "white" },
                ]}
              />
            )}
            mouseDownFunction={handleCloseClosedCaptionPage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseClosedCaptionPage}
          >
            Subtitles
          </div>
        </div>
        <FgButton
          contentFunction={() => (
            <div className='px-2 bg-opacity-75 hover:bg-gray-400 rounded font-Josefin text-lg font-bold pt-0.5'>
              Options
            </div>
          )}
          mouseDownFunction={handleClosedCaptionOptionsActive}
        />
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto px-2 h-max max-h-[11.375rem]'>
        {Object.entries(closedCaptionsSelections).map(([key, lang]) => (
          <div
            key={key}
            className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center ${
              key === settings.closedCaption.value
                ? "bg-gray-400"
                : "hover:bg-gray-400"
            }`}
          >
            <FgButton
              className='flex items-center justify-center grow'
              contentFunction={() => (
                <div className='w-full bg-opacity-75 px-2 flex items-start'>
                  {lang}
                </div>
              )}
              mouseDownFunction={() =>
                setClosedCaptionsLang(
                  key as keyof typeof closedCaptionsSelections
                )
              }
            />
            <FgButton
              className='w-max flex items-center justify-center'
              contentFunction={() => (
                <div className='w-full bg-opacity-75 px-2'>(AG)</div>
              )}
              mouseDownFunction={() =>
                setClosedCaptionsLang(
                  key as keyof typeof closedCaptionsSelections
                )
              }
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-sm bg-white shadow-lg rounded-md relative bottom-0'>
                  Auto generated
                </div>
              }
              options={{
                hoverTimeoutDuration: 2000,
                hoverZValue: 999999999999999,
              }}
            />
          </div>
        ))}
        {moreActive &&
          browserStandardSpeechRecognitionAvailable.current &&
          Object.entries(expandedClosedCaptionsBrowserSelections).map(
            ([key, lang]) => (
              <div
                key={key}
                className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center ${
                  key === settings.closedCaption.value
                    ? "bg-gray-400"
                    : "hover:bg-gray-400"
                }`}
              >
                <FgButton
                  className='flex items-center justify-center grow'
                  contentFunction={() => (
                    <div className='w-full bg-opacity-75 px-2 flex items-start'>
                      {lang}
                    </div>
                  )}
                  mouseDownFunction={() =>
                    setClosedCaptionsLang(
                      key as keyof typeof closedCaptionsSelections
                    )
                  }
                />
                <FgButton
                  className='w-max flex items-center justify-center'
                  contentFunction={() => (
                    <div className='w-full bg-opacity-75 px-2'>(AG)</div>
                  )}
                  mouseDownFunction={() =>
                    setClosedCaptionsLang(
                      key as keyof typeof closedCaptionsSelections
                    )
                  }
                  hoverContent={
                    <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-sm bg-white shadow-lg rounded-md relative bottom-0'>
                      Auto generated
                    </div>
                  }
                  options={{
                    hoverTimeoutDuration: 2000,
                    hoverZValue: 999999999999999,
                  }}
                />
              </div>
            )
          )}
        {moreActive &&
          !browserStandardSpeechRecognitionAvailable.current &&
          Object.entries(expandedClosedCaptionsVoskSelections).map(
            ([key, lang]) => (
              <div
                key={key}
                className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center ${
                  key === settings.closedCaption.value
                    ? "bg-gray-400"
                    : "hover:bg-gray-400"
                }`}
              >
                <FgButton
                  className='flex items-center justify-center grow'
                  contentFunction={() => (
                    <div className='w-full bg-opacity-75 px-2 flex items-start'>
                      {lang}
                    </div>
                  )}
                  mouseDownFunction={() =>
                    setClosedCaptionsLang(
                      key as keyof typeof closedCaptionsSelections
                    )
                  }
                />
                <FgButton
                  className='w-max flex items-center justify-center'
                  contentFunction={() => (
                    <div className='w-full bg-opacity-75 px-2'>(AG)</div>
                  )}
                  mouseDownFunction={() =>
                    setClosedCaptionsLang(
                      key as keyof typeof closedCaptionsSelections
                    )
                  }
                  hoverContent={
                    <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-sm bg-white shadow-lg rounded-md relative bottom-0'>
                      Auto generated
                    </div>
                  }
                  options={{
                    hoverTimeoutDuration: 2000,
                    hoverZValue: 999999999999999,
                  }}
                />
              </div>
            )
          )}
        <FgButton
          contentFunction={() => (
            <div className='w-full bg-opacity-75 px-2 flex items-start hover:bg-gray-400 rounded'>
              {moreActive ? "Less..." : "More..."}
            </div>
          )}
          mouseDownFunction={() => {
            setMoreActive((prev) => !prev);
          }}
        />
      </div>
    </div>
  );
}
