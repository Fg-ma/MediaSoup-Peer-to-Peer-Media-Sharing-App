export type ProducerTypes = "camera" | "screen" | "audio" | "json";

export type Permissions = {
  acceptsCameraEffects: boolean;
  acceptsScreenEffects: boolean;
  acceptsAudioEffects: boolean;
  acceptsPositionScaleRotationManipulation: boolean;
};
