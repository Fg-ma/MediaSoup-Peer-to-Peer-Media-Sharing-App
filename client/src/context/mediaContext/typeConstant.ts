import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import { DataProducer } from "mediasoup-client/lib/DataProducer";
import AudioMedia from "../../lib/AudioMedia";
import CameraMedia from "../../media/fgVisualMedia/CameraMedia";
import SnakeGameMedia from "../../lib/SnakeGameMedia";
import ScreenAudioMedia from "../../lib/ScreenAudioMedia";
import ScreenMedia from "../../media/fgVisualMedia/ScreenMedia";
import GamesSignalingMedia from "../../lib/GamesSignalingMedia";
import VideoMedia from "../../media/fgVideo/VideoMedia";
import ImageMedia from "../../media/fgImage/ImageMedia";
import ApplicationMedia from "../../media/fgApplication/ApplicationMedia";
import TextMedia from "../../media/fgText/TextMedia";

export type DataStreamTypes = "positionScaleRotation";

export type GameTypes = "snake";

export type UserMediaType = {
  camera: {
    [cameraId: string]: CameraMedia;
  };
  screen: { [screenId: string]: ScreenMedia };
  screenAudio: { [screenAudioId: string]: ScreenAudioMedia };
  audio: AudioMedia | undefined;
  video: {
    [videoId: string]: VideoMedia;
  };
  image: {
    [imageId: string]: ImageMedia;
  };
  applications: {
    [applicationsId: string]: ApplicationMedia;
  };
  text: {
    [textId: string]: TextMedia;
  };
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
