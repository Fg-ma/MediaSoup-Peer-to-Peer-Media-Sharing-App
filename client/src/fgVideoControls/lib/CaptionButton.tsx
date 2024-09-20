import React, { useEffect, useState } from "react";
import { createModel, KaldiRecognizer, Model } from "vosk-browser";
import Controls from "./Controls";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import { Settings } from "../../fgVideo/FgVideo";

import captionsIcon from "../../../public/svgs/captionsIcon.svg";

const models: { [model: string]: string } = {
  Catalan: "vosk-model-small-ca-0.4.tar.gz",
  Chinese: "vosk-model-small-cn-0.3.tar.gz",
  Deutsch: "vosk-model-small-de-0.15.tar.gz",
  IndianEnglish: "vosk-model-small-en-in-0.4.tar.gz",
  English: "vosk-model-small-en-us-0.15.tar.gz",
  Español: "vosk-model-small-es-0.3.tar.gz",
  Farsi: "vosk-model-small-fa-0.4.tar.gz",
  French: "vosk-model-small-fr-pguyot-0.3.tar.gz",
  Italiano: "vosk-model-small-it-0.4.tar.gz",
  Portuguese: "vosk-model-small-pt-0.3.tar.gz",
  Russian: "vosk-model-small-ru-0.4.tar.gz",
  Turkish: "vosk-model-small-tr-0.3.tar.gz",
  Vietnamese: "vosk-model-small-vn-0.3.tar.gz",
};

interface VoskResult {
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
}: {
  controls: Controls;
  effectsActive: boolean;
  settingsActive: boolean;
  settings: Settings;
  audioStream: MediaStream;
}) {
  const [active, setActive] = useState(false);
  const [utterances, setUtterances] = useState<VoskResult[]>([]);
  const [partial, setPartial] = useState("");
  const [loadedModel, setLoadedModel] = useState<{
    model: Model;
    path: string;
  }>();
  const [recognizer, setRecognizer] = useState<KaldiRecognizer>();
  const [loading, setLoading] = useState(false);

  // Function to load model
  const loadModel = async (path: string) => {
    setLoading(true);
    if (loadedModel?.model) {
      loadedModel.model.terminate(); // Properly clean up old model
    }

    try {
      console.log(`/speechToTextModels/${path}`);
      const model = await createModel(`/speechToTextModels/${path}`);
      setLoadedModel({ model, path });

      // Create recognizer
      const recognizer = new model.KaldiRecognizer(48000);
      recognizer.setWords(true);

      // Add event listener for "result"
      recognizer.on("result", (message: any) => {
        console.log("Recognizer result event fired:", message);
        const result: VoskResult = message;
        setUtterances((prevUtterances) => [...prevUtterances, result]);
      });

      // Add event listener for "partialresult"
      recognizer.on("partialresult", (message: any) => {
        const partialResult = message.partial;
        setPartial(partialResult);
      });

      setRecognizer(() => {
        setLoading(false);
        return recognizer;
      });
    } catch (error) {
      console.error("Error loading model:", error);
      setLoading(false);
    }
  };

  // Function to process microphone audio and feed it to the recognizer
  const processMicrophoneAudio = (
    stream: MediaStream,
    recognizer: KaldiRecognizer
  ) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1); // Buffer size of 4096 samples

    processor.onaudioprocess = (event) => {
      // Get the audio data from the input buffer (Float32Array)
      const float32Array = event.inputBuffer.getChannelData(0); // Channel 0 audio data

      // Create an AudioBuffer to pass to Vosk
      const audioBuffer = audioContext.createBuffer(
        1,
        float32Array.length,
        audioContext.sampleRate
      );

      // Copy the float32Array data into the AudioBuffer
      audioBuffer.copyToChannel(float32Array, 0);

      // Pass the AudioBuffer directly to Vosk recognizer
      recognizer.acceptWaveform(audioBuffer);
    };

    source.connect(processor);
    processor.connect(audioContext.destination); // Keep audio stream alive
  };

  useEffect(() => {
    if (audioStream && recognizer) {
      processMicrophoneAudio(audioStream, recognizer);
    }
  }, [audioStream, recognizer]);
  console.log(utterances, loading);
  return (
    <FgButton
      clickFunction={() => {
        if (!active) {
          loadModel(models[settings.closedCaption.value]);
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
      className='caption-button flex-col items-center justify-center scale-x-[-1]'
    />
  );
}
