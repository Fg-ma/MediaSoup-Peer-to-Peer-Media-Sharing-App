import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import { DataProducer } from "mediasoup-client/lib/DataProducer";
import AudioMedia from "../../lib/AudioMedia";
import CameraMedia from "../../lib/CameraMedia";
import SnakeGameMedia from "../../lib/SnakeGameMedia";
import ScreenAudioMedia from "../../lib/ScreenAudioMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import GamesSignalingMedia from "../../lib/GamesSignalingMedia";

export type DataStreamTypes = "positionScaleRotation";

export type GameTypes = "snake";

export type UserMediaType = {
  camera: {
    [cameraId: string]: CameraMedia;
  };
  screen: { [screenId: string]: ScreenMedia };
  screenAudio: { [screenAudioId: string]: ScreenAudioMedia };
  audio: AudioMedia | undefined;
  gamesSignaling: GamesSignalingMedia | undefined;
  games: {
    snake?: {
      [gameId: string]: SnakeGameMedia;
    };
  };
};

export type RemoteMediaType = {
  [username: string]: {
    [instance: string]: {
      camera?: { [cameraId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      screenAudio?: { [screenAudioId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack;
    };
  };
};

export type RemoteDataStreamsType = {
  [username: string]: {
    [instance: string]: {
      positionScaleRotation?: DataConsumer;
    };
  };
};

export type UserDataStreamsType = {
  positionScaleRotation?: DataProducer;
};
