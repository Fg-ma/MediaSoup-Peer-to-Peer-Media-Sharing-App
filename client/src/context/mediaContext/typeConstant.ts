import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import { DataProducer } from "mediasoup-client/lib/DataProducer";
import AudioMedia from "../../media/audio/AudioMedia";
import CameraMedia from "../../media/fgVisualMedia/CameraMedia";
import SnakeGameMedia from "../../media/games/snakeGame/SnakeGameMedia";
import ScreenAudioMedia from "../../media/screenAudio/ScreenAudioMedia";
import ScreenMedia from "../../media/fgVisualMedia/ScreenMedia";
import GamesSignalingMedia from "../../media/games/GamesSignalingMedia";
import VideoMedia from "../../media/fgVideo/VideoMedia";
import ImageMedia from "../../media/fgImage/ImageMedia";
import ApplicationMedia from "../../media/fgApplication/ApplicationMedia";
import TextMedia from "../../media/fgText/TextMedia";
import SoundClipMedia from "../../media/soundClip/SoundClipMedia";
import SvgMedia from "../../media/fgSvg/SvgMedia";
import SvgMediaInstance from "src/media/fgSvg/SvgMediaInstance";

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
    all: {
      [videoId: string]: VideoMedia;
    };
    instances: {
      [videoId: string]: VideoMedia;
    };
  };
  image: {
    all: {
      [imageId: string]: ImageMedia;
    };
    instances: {
      [imageId: string]: ImageMedia;
    };
  };
  svg: {
    all: {
      [svgId: string]: SvgMedia;
    };
    instances: {
      [svgId: string]: SvgMediaInstance;
    };
  };
  application: {
    all: {
      [applicationId: string]: ApplicationMedia;
    };
    instances: {
      [applicationId: string]: ApplicationMedia;
    };
  };
  text: {
    all: {
      [textId: string]: TextMedia;
    };
    instances: {
      [textId: string]: TextMedia;
    };
  };
  soundClip: {
    all: {
      [soundClipId: string]: SoundClipMedia;
    };
    instances: {
      [soundClipId: string]: SoundClipMedia;
    };
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
