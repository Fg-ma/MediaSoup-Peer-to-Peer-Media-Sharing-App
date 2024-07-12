import * as mediasoup from "mediasoup-client";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import { EffectTypes } from "src/context/StreamsContext";
import handleEffectWebGL from "./EffectsWebGL/handleEffectWebGL";
import handleEffectCPU from "./EffectsCPU/handleEffectCPU";
import EffectsWebGL from "./EffectsWebGL/EffectsWebGL";

class Effects {
  private track: MediaStreamTrack | undefined;

  private type: "webcam" | "screen" | "audio";
  private id: string;
  private userStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>;
  private userUneffectedStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>;
  private userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      webcam?:
        | {
            [webcamId: string]: boolean;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: boolean;
          }
        | undefined;
      audio?: boolean;
    };
  }>;
  private userStopStreamEffects: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
  }>;
  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  private producerTransport:
    | React.MutableRefObject<
        mediasoup.types.Transport<mediasoup.types.AppData> | undefined
      >
    | undefined;

  private effectsWebGL: EffectsWebGL;

  constructor(
    type: "webcam" | "screen" | "audio",
    id: string,
    userStreams: React.MutableRefObject<{
      webcam: {
        [webcamId: string]: MediaStream;
      };
      screen: {
        [screenId: string]: MediaStream;
      };
      audio: MediaStream | undefined;
    }>,
    userUneffectedStreams: React.MutableRefObject<{
      webcam: {
        [webcamId: string]: MediaStream;
      };
      screen: {
        [screenId: string]: MediaStream;
      };
      audio: MediaStream | undefined;
    }>,
    userStreamEffects: React.MutableRefObject<{
      [effectType in EffectTypes]: {
        webcam?:
          | {
              [webcamId: string]: boolean;
            }
          | undefined;
        screen?:
          | {
              [screenId: string]: boolean;
            }
          | undefined;
        audio?: boolean;
      };
    }>,
    userStopStreamEffects: React.MutableRefObject<{
      webcam: {
        [webcamId: string]: () => void;
      };
      screen: {
        [screenId: string]: () => void;
      };
      audio: (() => void) | undefined;
    }>,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    producerTransport:
      | React.MutableRefObject<
          mediasoup.types.Transport<mediasoup.types.AppData> | undefined
        >
      | undefined,
    tintColor: string
  ) {
    this.type = type;
    this.id = id;
    this.userStreams = userStreams;
    this.userUneffectedStreams = userUneffectedStreams;
    this.userStreamEffects = userStreamEffects;
    this.userStopStreamEffects = userStopStreamEffects;
    this.currentEffectsStyles = currentEffectsStyles;
    this.producerTransport = producerTransport;

    // Set user streams
    let effects: { [effect in EffectTypes]?: boolean } = {};

    for (const effect in this.userStreamEffects.current) {
      const effectType = effect as keyof typeof this.userStreamEffects.current;
      for (const kind in this.userStreamEffects.current[effectType]) {
        const kindType = kind as "webcam" | "screen";
        for (const kindId in this.userStreamEffects.current[effectType][
          kindType
        ]) {
          if (kindId === this.id) {
            if (
              this.userStreamEffects.current[effectType][kindType]![this.id]
            ) {
              effects[effectType] = true;
            }
          }
        }
      }
    }

    this.effectsWebGL = new EffectsWebGL(
      this.type,
      this.id,
      this.userUneffectedStreams,
      this.userStopStreamEffects,
      effects,
      this.currentEffectsStyles,
      tintColor
    );
    // console.log(this.effectsWebGL);
    // this.track =
    //   this.type === "webcam" || this.type === "screen"
    //     ? this.userStreams.current[this.type][this.id].getTracks()[0]
    //     : this.type === "audio"
    //     ? this.userStreams.current[this.type]?.getTracks()[0]
    //     : undefined;
  }

  async changeEffect(
    effect: EffectTypes,
    tintColor: React.MutableRefObject<string>,
    blockStateChange: boolean = false
  ) {
    // Set uneffected screen if necesary
    let activeEffect = false;
    for (const effect in this.userStreamEffects.current) {
      const effectType = effect as keyof typeof this.userStreamEffects.current;
      for (const kind in this.userStreamEffects.current[effectType]) {
        const kindType = kind as "webcam" | "screen" | "audio";
        if (this.type === kindType) {
          if (kindType === "webcam" || kindType === "screen") {
            for (const kindId in this.userStreamEffects.current[effectType][
              kindType
            ]) {
              if (kindId === this.id) {
                if (
                  this.userStreamEffects.current[effectType][kindType]![this.id]
                ) {
                  activeEffect = true;
                }
              }
            }
          } else if (kindType === "audio") {
            if (this.userStreamEffects.current[effectType][kindType]!) {
              activeEffect = true;
            }
          }
        }
      }
    }
    if (!activeEffect) {
      if (this.type === "webcam" || this.type === "screen") {
        this.userUneffectedStreams.current[this.type][this.id] =
          this.userStreams.current[this.type][this.id];
      } else if (this.type === "audio") {
        this.userUneffectedStreams.current[this.type] =
          this.userStreams.current[this.type];
      }
    }

    // Create empty stream effects
    if (!this.userStreamEffects.current[effect][this.type]) {
      if (this.type === "webcam" || this.type === "screen") {
        this.userStreamEffects.current[effect][this.type] = {};
      } else if (this.type === "audio") {
        this.userStreamEffects.current[effect][this.type] = false;
      }
    }
    if (
      (this.type === "webcam" || this.type === "screen") &&
      !this.userStreamEffects.current[effect][this.type]
    ) {
      this.userStreamEffects.current[effect][this.type]![this.id] = false;
    }
    // Fill stream effects
    if (!blockStateChange) {
      if (this.type === "webcam" || this.type === "screen") {
        this.userStreamEffects.current[effect][this.type]![this.id] =
          !this.userStreamEffects.current[effect][this.type]![this.id];
      } else if (this.type === "audio") {
        this.userStreamEffects.current[effect][this.type] =
          !this.userStreamEffects.current[effect][this.type];
      }
    }

    // Stop old effect streams
    for (const kind in this.userStopStreamEffects.current) {
      const kindType = kind as "webcam" | "screen" | "audio";
      if (this.type === kindType) {
        if (kindType === "webcam" || kindType === "screen") {
          for (const kindId in this.userStopStreamEffects.current[kindType]) {
            if (kindId === this.id) {
              this.userStopStreamEffects.current[kindType][this.id]();
            }
          }
        } else if (kindType === "audio") {
          this.userStopStreamEffects.current[kindType]!();
        }
      }
    }

    // Set user streams
    let effects: { [effect in EffectTypes]?: boolean } = {};

    for (const effect in this.userStreamEffects.current) {
      const effectType = effect as keyof typeof this.userStreamEffects.current;
      for (const kind in this.userStreamEffects.current[effectType]) {
        const kindType = kind as "webcam" | "screen";
        for (const kindId in this.userStreamEffects.current[effectType][
          kindType
        ]) {
          if (kindId === this.id) {
            if (
              this.userStreamEffects.current[effectType][kindType]![this.id]
            ) {
              effects[effectType] = true;
            }
          }
        }
      }
    }

    let finalTrack: MediaStreamTrack | undefined;
    if (Object.keys(effects).length !== 0) {
      const webGlEffect = await handleEffectWebGL(
        this.type,
        this.id,
        this.userUneffectedStreams,
        this.userStopStreamEffects,
        tintColor,
        effects,
        this.currentEffectsStyles
      );
      if (webGlEffect instanceof Error) {
        console.error(
          "Failed to render with WebGL defaulting to CPU render, which may effect performance!",
          webGlEffect
        );

        const cpuEffect = await handleEffectCPU(
          this.type,
          this.id,
          this.userUneffectedStreams,
          this.userStopStreamEffects,
          tintColor,
          effects,
          this.currentEffectsStyles
        );

        if (cpuEffect instanceof MediaStreamTrack) {
          finalTrack = cpuEffect;
        }
      } else {
        finalTrack = webGlEffect;
      }
    }

    if (this.type === "webcam" || this.type === "screen") {
      if (finalTrack) {
        this.userStreams.current[this.type][this.id] = new MediaStream([
          finalTrack,
        ]);
      } else if (this.userUneffectedStreams.current[this.type][this.id]) {
        this.userStreams.current[this.type][this.id] =
          this.userUneffectedStreams.current[this.type][this.id];
        finalTrack =
          this.userUneffectedStreams.current[this.type][
            this.id
          ].getVideoTracks()[0];
        delete this.userUneffectedStreams.current[this.type][this.id];
      }
    } else if (this.type === "audio") {
      if (finalTrack) {
        this.userStreams.current[this.type] = new MediaStream([finalTrack]);
      } else if (this.userUneffectedStreams.current[this.type]) {
        this.userStreams.current[this.type] =
          this.userUneffectedStreams.current[this.type];
        finalTrack =
          this.userUneffectedStreams.current[this.type]?.getAudioTracks()[0];
        delete this.userUneffectedStreams.current[this.type];
      }
    }

    if (!this.track && finalTrack) {
      this.track = finalTrack;
      const params = {
        track: this.track,
        appData: {
          producerType: this.type,
          producerDirection: "swap",
          producerId: this.id,
        },
      };

      try {
        await this.producerTransport?.current?.produce(params);
      } catch (error) {
        return new Error(`Transport failed to produce: ${error}`);
      }
    } else if (finalTrack) {
      this.track = finalTrack;
    }
  }
}

export default Effects;
