import { createModel, KaldiRecognizer, Model } from "vosk-browser";
import { browserLangs, VoskResult } from "./CaptionButton";

class CaptionsFunctions {
  private loadedVoskModel?: {
    model: Model;
    path: string;
  };
  private setLoadedVoskModel: React.Dispatch<
    React.SetStateAction<
      | {
          model: Model;
          path: string;
        }
      | undefined
    >
  >;

  private voskRecognizer: React.MutableRefObject<KaldiRecognizer | undefined>;

  private SpeechRecognition: any;
  private browserRecognizer: React.MutableRefObject<any>;

  private browserLang: browserLangs;

  private setBrowserCaptions: React.Dispatch<React.SetStateAction<string>>;
  private setVoskCaptions: React.Dispatch<
    React.SetStateAction<VoskResult | undefined>
  >;

  private browserStandardSpeechRecognitionAvailable: React.MutableRefObject<boolean>;

  constructor(
    loadedVoskModel:
      | {
          model: Model;
          path: string;
        }
      | undefined,
    setLoadedVoskModel: React.Dispatch<
      React.SetStateAction<
        | {
            model: Model;
            path: string;
          }
        | undefined
      >
    >,

    voskRecognizer: React.MutableRefObject<KaldiRecognizer | undefined>,

    browserRecognizer: React.MutableRefObject<any>,

    browserLang: browserLangs,

    setBrowserCaptions: React.Dispatch<React.SetStateAction<string>>,
    setVoskCaptions: React.Dispatch<
      React.SetStateAction<VoskResult | undefined>
    >,

    browserStandardSpeechRecognitionAvailable: React.MutableRefObject<boolean>
  ) {
    this.loadedVoskModel = loadedVoskModel;
    this.setLoadedVoskModel = setLoadedVoskModel;
    this.voskRecognizer = voskRecognizer;
    this.browserRecognizer = browserRecognizer;
    this.browserLang = browserLang;
    this.setBrowserCaptions = setBrowserCaptions;
    this.setVoskCaptions = setVoskCaptions;
    this.browserStandardSpeechRecognitionAvailable =
      browserStandardSpeechRecognitionAvailable;

    this.SpeechRecognition =
      // @ts-ignore
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (this.SpeechRecognition) {
      const newBrowserRecognizer = new this.SpeechRecognition();
      newBrowserRecognizer.continuous = true; // Keep listening until stopped
      newBrowserRecognizer.interimResults = true; // Provide partial results

      newBrowserRecognizer.lang = this.browserLang;

      newBrowserRecognizer.onresult = (event: any) => {
        let newBrowserCaptions = "";

        // Iterate through results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          newBrowserCaptions += result[0].transcript;
        }
        this.setBrowserCaptions(newBrowserCaptions);
      };

      this.browserRecognizer.current = newBrowserRecognizer;
    } else {
      this.browserStandardSpeechRecognitionAvailable.current = false;
    }
  }

  // Function to load vosk model
  loadVoskModel = async (path: string) => {
    if (this.loadedVoskModel?.path === path) {
      return;
    }

    if (this.loadedVoskModel?.model) {
      this.loadedVoskModel.model.terminate(); // Properly clean up old model
    }

    try {
      const model = await createModel(`/speechToTextModels/${path}`);
      this.setLoadedVoskModel({ model, path });

      // Create recognizer
      const recognizer = new model.KaldiRecognizer(48000);
      recognizer.setWords(true);

      // Add event listener for "result"
      recognizer.on("result", (message: any) => {
        const result: VoskResult = message;
        this.setVoskCaptions(result);
      });

      this.voskRecognizer.current = recognizer;
    } catch (error) {
      console.error("Error loading model:", error);
    }
  };

  // Function to process audio stream and feed it to the recognizer
  voskProcessAudioStream = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(1024, 1, 1);

    processor.onaudioprocess = (event) => {
      if (!this.voskRecognizer.current) {
        return;
      }

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
      this.voskRecognizer.current.acceptWaveform(audioBuffer);
    };

    source.connect(processor);
    processor.connect(audioContext.destination); // Keep audio stream alive
  };
}

export default CaptionsFunctions;
