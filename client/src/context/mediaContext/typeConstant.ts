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
import SoundClipMedia from "../../media/fgSoundClip/SoundClipMedia";
import SvgMedia from "../../media/fgSvg/SvgMedia";
import SvgMediaInstance from "src/media/fgSvg/SvgMediaInstance";
import TextMediaInstance from "src/media/fgText/TextMediaInstance";
import ApplicationMediaInstance from "src/media/fgApplication/ApplicationMediaInstance";
import ImageMediaInstance from "src/media/fgImage/ImageMediaInstance";
import VideoMediaInstance from "src/media/fgVideo/VideoMediaInstance";
import SoundClipMediaInstance from "src/media/fgSoundClip/SoundClipMediaInstance";

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
      [videoId: string]: VideoMediaInstance;
    };
  };
  image: {
    all: {
      [imageId: string]: ImageMedia;
    };
    instances: {
      [imageId: string]: ImageMediaInstance;
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
      [applicationId: string]: ApplicationMediaInstance;
    };
  };
  text: {
    all: {
      [textId: string]: TextMedia;
    };
    instances: {
      [textId: string]: TextMediaInstance;
    };
  };
  soundClip: {
    all: {
      [soundClipId: string]: SoundClipMedia;
    };
    instances: {
      [soundClipId: string]: SoundClipMediaInstance;
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
