import { StaticContentTypes } from "../../../../../universal/typeConstant";
import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
  AudioEffectTypes,
  ImageEffectStylesType,
  ImageEffectTypes,
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../context/effectsContext/typeConstant";

export type TableTopStaticMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "video/mp4"
  | "video/mpeg"
  | "image/gif"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type OutGoingTableStaticContentMessages =
  | onJoinTableType
  | onLeaveTableType
  | onRequestCatchUpTableDataType
  | onDeleteContentType
  | onGetFileType
  | onUpdateContentPositioningType
  | onUpdateContentEffectsType
  | onUpdateVideoPositionType
  | onRequestCatchUpVideoPositionType
  | onResponseCatchUpVideoPositionType;

type onJoinTableType = {
  type: "joinTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

type onLeaveTableType = {
  type: "leaveTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

type onRequestCatchUpTableDataType = {
  type: "requestCatchUpTableData";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

type onDeleteContentType = {
  type: "deleteContent";
  header: {
    table_id: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    filename: string;
  };
};

type onGetFileType = {
  type: "getFile";
  header: {
    table_id: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: { key: string };
};

type onUpdateContentPositioningType = {
  type: "updateContentPositioning";
  header: {
    table_id: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    positioning: {
      position?: {
        left: number;
        top: number;
      };
      scale?: {
        x: number;
        y: number;
      };
      rotation?: number;
    };
  };
};

type onUpdateContentEffectsType = {
  type: "updateContentEffects";
  header: {
    table_id: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    effects: {
      [effectType: string]: boolean;
    };
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
      | ApplicationEffectStylesType;
  };
};

type onUpdateVideoPositionType = {
  type: "updateVideoPosition";
  header: {
    table_id: string;
    contentType: "video";
    contentId: string;
  };
  data: {
    videoPosition: number;
  };
};

type onRequestCatchUpVideoPositionType = {
  type: "requestCatchUpVideoPosition";
  header: {
    table_id: string;
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
  };
};

type onResponseCatchUpVideoPositionType = {
  type: "responseCatchUpVideoPosition";
  header: {
    table_id: string;
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
  };
  data: {
    currentVideoPosition: number;
  };
};

export type IncomingTableStaticContentMessages =
  | { type: undefined }
  | onOriginalVideoReadyType
  | onDashVideoReadyType
  | onImageReadyType
  | onTextReadyType
  | onChunkType
  | onDownloadCompleteType
  | onResponsedCatchUpTableDataType
  | onContentDeletedType
  | onUpdatedContentEffectsType
  | onUpdatedVideoPositionType
  | onRequestedCatchUpVideoPositionType
  | onRespondedCatchUpVideoPositionType;

export type onOriginalVideoReadyType = {
  type: "originalVideoReady";
  header: {
    videoId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
  };
};

export type onDashVideoReadyType = {
  type: "dashVideoReady";
  header: {
    videoId: string;
  };
  data: {
    filename: string;
  };
};

export type onImageReadyType = {
  type: "imageReady";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
  };
};

export type onTextReadyType = {
  type: "textReady";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
  };
};

export type onChunkType = {
  type: "chunk";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
    key: string;
  };
  data: {
    chunk: { data: number[] };
  };
};

export type onDownloadCompleteType = {
  type: "downloadComplete";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
    key: string;
  };
};

export type onResponsedCatchUpTableDataType = {
  type: "responsedCatchUpTableData";
  data: {
    images:
      | {
          table_id: string;
          imageId: string;
          filename: string;
          mimeType: string;
          positioning: {
            position: {
              left: number;
              top: number;
            };
            scale: {
              x: number;
              y: number;
            };
            rotation: number;
          };
          effects: { [effectType in ImageEffectTypes]: boolean };
          effectStyles: ImageEffectStylesType;
        }[]
      | undefined;
    videos:
      | {
          table_id: string;
          videoId: string;
          filename: string;
          mimeType: string;
          positioning: {
            position: {
              left: number;
              top: number;
            };
            scale: {
              x: number;
              y: number;
            };
            rotation: number;
          };
          effects: { [effectType in VideoEffectTypes]: boolean };
          effectStyles: VideoEffectStylesType;
          videoPosition: number;
        }[]
      | undefined;
    text:
      | {
          table_id: string;
          textId: string;
          filename: string;
          mimeType: string;
          positioning: {
            position: {
              left: number;
              top: number;
            };
            scale: {
              x: number;
              y: number;
            };
            rotation: number;
          };
        }[]
      | undefined;
    audio:
      | {
          table_id: string;
          audioId: string;
          filename: string;
          mimeType: string;
          positioning: {
            position: {
              left: number;
              top: number;
            };
            scale: {
              x: number;
              y: number;
            };
            rotation: number;
          };
          effects: { [effectType in AudioEffectTypes]: boolean };
        }[]
      | undefined;
    applications:
      | {
          table_id: string;
          applicationId: string;
          filename: string;
          mimeType: string;
          positioning: {
            position: {
              left: number;
              top: number;
            };
            scale: {
              x: number;
              y: number;
            };
            rotation: number;
          };
          effects: { [effectType in ApplicationEffectTypes]: boolean };
          effectStyles: ApplicationEffectStylesType;
        }[]
      | undefined;
  };
};

export type onContentDeletedType = {
  type: "contentDeleted";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
};

export type onUpdatedContentEffectsType = {
  type: "updatedContentEffects";
  header: { contentType: StaticContentTypes; contentId: string };
  data: {
    effects: {
      [effectType: string]: boolean;
    };
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
      | ApplicationEffectStylesType;
  };
};

export type onUpdatedVideoPositionType = {
  type: "updatedVideoPosition";
  header: {
    contentType: "video";
    contentId: string;
  };
  data: {
    videoPosition: number;
  };
};

export type onRequestedCatchUpVideoPositionType = {
  type: "requestedCatchUpVideoPosition";
  header: {
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
  };
};

export type onRespondedCatchUpVideoPositionType = {
  type: "respondedCatchUpVideoPosition";
  header: {
    contentType: "video";
    contentId: string;
  };
  data: {
    currentVideoPosition: number;
  };
};
