import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import { DataProducer } from "mediasoup-client/lib/DataProducer";
import AudioMedia from "../../media/audio/AudioMedia";
import CameraMedia from "../../media/fgVisualMedia/CameraMedia";
import SnakeGameMedia from "../../media/games/snakeGame/SnakeGameMedia";
import ScreenAudioMedia from "../../media/screenAudio/ScreenAudioMedia";
import ScreenMedia from "../../media/fgVisualMedia/ScreenMedia";
import GamesSignalingMedia from "../../media/games/GamesSignalingMedia";
import TableVideoMedia from "../../media/fgTableVideo/TableVideoMedia";
import TableImageMedia from "../../media/fgTableImage/TableImageMedia";
import TableApplicationMedia from "../../media/fgTableApplication/TableApplicationMedia";
import TableTextMedia from "../../media/fgTableText/TableTextMedia";
import TableSoundClipMedia from "../../media/fgTableSoundClip/TableSoundClipMedia";
import TableSvgMedia from "../../media/fgTableSvg/TableSvgMedia";
import TableSvgMediaInstance from "../../media/fgTableSvg/TableSvgMediaInstance";
import TableTextMediaInstance from "../../media/fgTableText/TableTextMediaInstance";
import TableApplicationMediaInstance from "../../media/fgTableApplication/TableApplicationMediaInstance";
import TableImageMediaInstance from "../../media/fgTableImage/TableImageMediaInstance";
import TableVideoMediaInstance from "../../media/fgTableVideo/TableVideoMediaInstance";
import TableSoundClipMediaInstance from "../../media/fgTableSoundClip/TableSoundClipMediaInstance";
import UserVideoMedia from "../../media/fgUserVideo/UserVideoMedia";
import UserImageMedia from "../../media/fgUserImage/UserImageMedia";
import UserSvgMedia from "../../media/fgUserSvg/UserSvgMedia";
import UserApplicationMedia from "../../media/fgUserApplication /UserApplicationMedia";
import UserTextMedia from "../../media/fgUserText/UserTextMedia";
import UserSoundClipMedia from "../../media/fgUserSoundClip/UserSoundClipMedia";

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
    user: {
      [videoId: string]: UserVideoMedia;
    };
    table: {
      [videoId: string]: TableVideoMedia;
    };
    tableInstances: {
      [videoId: string]: TableVideoMediaInstance;
    };
  };
  image: {
    user: {
      [videoId: string]: UserImageMedia;
    };
    table: {
      [imageId: string]: TableImageMedia;
    };
    tableInstances: {
      [imageId: string]: TableImageMediaInstance;
    };
  };
  svg: {
    user: {
      [videoId: string]: UserSvgMedia;
    };
    table: {
      [svgId: string]: TableSvgMedia;
    };
    tableInstances: {
      [svgId: string]: TableSvgMediaInstance;
    };
  };
  application: {
    user: {
      [videoId: string]: UserApplicationMedia;
    };
    table: {
      [applicationId: string]: TableApplicationMedia;
    };
    tableInstances: {
      [applicationId: string]: TableApplicationMediaInstance;
    };
  };
  text: {
    user: {
      [videoId: string]: UserTextMedia;
    };
    table: {
      [textId: string]: TableTextMedia;
    };
    tableInstances: {
      [textId: string]: TableTextMediaInstance;
    };
  };
  soundClip: {
    user: {
      [videoId: string]: UserSoundClipMedia;
    };
    table: {
      [soundClipId: string]: TableSoundClipMedia;
    };
    tableInstances: {
      [soundClipId: string]: TableSoundClipMediaInstance;
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
