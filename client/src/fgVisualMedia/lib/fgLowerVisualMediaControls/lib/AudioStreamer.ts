import { Duplex, DuplexOptions } from "readable-stream";
import { KaldiRecognizer } from "vosk-browser";

export class AudioStreamer extends Duplex {
  constructor(public recognizer: KaldiRecognizer, options?: DuplexOptions) {
    super(options);
  }

  public _write(
    chunk: AudioBuffer,
    _encoding: string,
    callback: (error?: Error | null | undefined) => void
  ) {
    const buffer = chunk.getChannelData(0);
    if (this.recognizer && buffer.byteLength > 0) {
      this.recognizer.acceptWaveform(chunk);
    }
    callback();
  }
}
