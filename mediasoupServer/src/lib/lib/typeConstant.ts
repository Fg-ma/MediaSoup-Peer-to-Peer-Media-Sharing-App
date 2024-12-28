export type ProducerTypes =
  | "camera"
  | "screen"
  | "screenAudio"
  | "audio"
  | "json";

export type Permissions = {
  acceptsCameraEffects: boolean;
  acceptsScreenEffects: boolean;
  acceptsAudioEffects: boolean;
  acceptsPositionScaleRotationManipulation: boolean;
};
