import { createModel, KaldiRecognizer, Model } from "vosk-browser";
import { RecognizerMessage } from "vosk-browser/dist/interfaces";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

class CaptionsController {
  constructor(
    private loadedVoskModel:
      | {
          model: Model;
          path: string;
        }
      | undefined,
    private setLoadedVoskModel: React.Dispatch<
      React.SetStateAction<
        | {
            model: Model;
            path: string;
          }
        | undefined
      >
    >,

    private voskRecognizer: React.MutableRefObject<KaldiRecognizer | undefined>,

    private setVoskCaptions: React.Dispatch<React.SetStateAction<string>>
  ) {}

  // Function to load vosk model
  loadVoskModel = async (path: string) => {
    if (this.loadedVoskModel?.path === path) {
      return;
    }

    if (this.loadedVoskModel?.model) {
      this.loadedVoskModel.model.terminate(); // Properly clean up old model
    }

    try {
      const model = await createModel(
        `${nginxAssetSeverBaseUrl}speechToTextModels/${path}`
      );

      // Create recognizer
      const recognizer = new model.KaldiRecognizer(48000);
      recognizer.setWords(true);

      recognizer.on("partialresult", (message: RecognizerMessage) => {
        const results = message as { result: { partial: string } };
        if (results.result.partial !== "") {
          this.setVoskCaptions(results.result.partial);
        }
      });

      this.voskRecognizer.current = recognizer;
      this.setLoadedVoskModel({ model, path });
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

export default CaptionsController;
