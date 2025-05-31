import {
  TableContentStateTypes,
  StaticContentTypes,
} from "../../../../../universal/contentTypeConstant";
import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
  AudioEffectTypes,
  ImageEffectStylesType,
  ImageEffectTypes,
  SvgEffectStylesType,
  SvgEffectTypes,
  TextEffectStylesType,
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../../universal/effectsTypeConstant";

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
  | onGetDownloadMetaType
  | onGetFileChunkType
  | onUpdateContentPositioningType
  | onUpdateContentEffectsType
  | onUpdateVideoPositionType
  | onRequestCatchUpVideoPositionType
  | onResponseCatchUpVideoPositionType
  | onChangeContentStateType
  | onCreateNewInstancesType
  | onSearchTabledContentRequestType
  | onDeleteUploadSessionType;

type onJoinTableType = {
  type: "joinTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onLeaveTableType = {
  type: "leaveTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onRequestCatchUpTableDataType = {
  type: "requestCatchUpTableData";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

type onDeleteContentType = {
  type: "deleteContent";
  header: {
    tableId: string;
    contentType: StaticContentTypes;
    contentId: string;
    instanceId: string;
  };
};

type onGetDownloadMetaType = {
  type: "getDownloadMeta";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
};

type onGetFileChunkType = {
  type: "getFileChunk";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    range: string;
  };
};

type onUpdateContentPositioningType = {
  type: "updateContentPositioning";
  header: {
    tableId: string;
    contentType: StaticContentTypes;
    contentId: string;
    instanceId: string;
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
    tableId: string;
    contentType: StaticContentTypes;
    contentId: string;
    instanceId: string;
  };
  data: {
    effects?: {
      [effectType: string]: boolean;
    };
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
      | ApplicationEffectStylesType
      | SvgEffectStylesType
      | TextEffectStylesType;
  };
};

type onUpdateVideoPositionType = {
  type: "updateVideoPosition";
  header: {
    tableId: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
  data: {
    videoPosition: number;
  };
};

type onRequestCatchUpVideoPositionType = {
  type: "requestCatchUpVideoPosition";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
};

type onResponseCatchUpVideoPositionType = {
  type: "responseCatchUpVideoPosition";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
  data: {
    currentVideoPosition: number;
  };
};

type onChangeContentStateType = {
  type: "changeContentState";
  header: {
    tableId: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    state: TableContentStateTypes[];
  };
};

type onCreateNewInstancesType = {
  type: "createNewInstances";
  header: {
    tableId: string;
  };
  data: {
    updates: {
      contentType: StaticContentTypes;
      contentId: string;
      instances: {
        instanceId: string;
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
      }[];
    }[];
  };
};

type onSearchTabledContentRequestType = {
  type: "searchTabledContentRequest";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes | "all";
  };
  data: {
    name: string;
  };
};

type onDeleteUploadSessionType = {
  type: "deleteUploadSession";
  header: { uploadId: string };
};

export type IncomingTableStaticContentMessages =
  | { type: undefined }
  | onSoundClipUploadedToTableType
  | onSoundClipUploadedToTabledType
  | onSoundClipReuploadedType
  | onApplicationUploadedToTableType
  | onApplicationUploadedToTabledType
  | onApplicationReuploadedType
  | onVideoUploadedToTableType
  | onVideoUploadedToTabledType
  | onVideoReuploadedType
  | onDashVideoReadyType
  | onImageUploadedToTableType
  | onImageUploadedToTabledType
  | onImageReuploadedType
  | onSvgUploadedToTableType
  | onSvgUploadedToTabledType
  | onSvgReuploadedType
  | onTextUploadedToTableType
  | onTextUploadedToTabledType
  | onTextReuploadedType
  | onChunkType
  | onChunkErrorType
  | onDownloadMetaType
  | onOneShotDownloadType
  | onDownloadErrorType
  | onResponsedCatchUpTableDataType
  | onContentDeletedType
  | onContentStateChangedType
  | onUpdatedContentEffectsType
  | onUpdatedVideoPositionType
  | onRequestedCatchUpVideoPositionType
  | onRespondedCatchUpVideoPositionType
  | onCreatedNewInstancesType
  | onSearchTabledContentRespondedType;

export type onVideoUploadedToTableType = {
  type: "videoUploadedToTable";
  header: {
    contentId: string;
    instanceId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
    initPositioning:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined;
  };
};

export type onVideoUploadedToTabledType = {
  type: "videoUploadedToTabled";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
  };
};

export type onVideoReuploadedType = {
  type: "videoReuploaded";
  header: {
    contentId: string;
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

export type onImageUploadedToTableType = {
  type: "imageUploadedToTable";
  header: {
    contentId: string;
    instanceId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
    initPositioning:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined;
  };
};

export type onImageUploadedToTabledType = {
  type: "imageUploadedToTabled";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
  };
};

export type onImageReuploadedType = {
  type: "imageReuploaded";
  header: {
    contentId: string;
  };
};

export type onSvgUploadedToTableType = {
  type: "svgUploadedToTable";
  header: {
    contentId: string;
    instanceId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
    initPositioning:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined;
  };
};

export type onSvgUploadedToTabledType = {
  type: "svgUploadedToTabled";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
  };
};

export type onSvgReuploadedType = {
  type: "svgReuploaded";
  header: {
    contentId: string;
  };
};

export type onTextUploadedToTableType = {
  type: "textUploadedToTable";
  header: {
    contentId: string;
    instanceId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
    initPositioning:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined;
  };
};

export type onTextUploadedToTabledType = {
  type: "textUploadedToTabled";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
  };
};

export type onTextReuploadedType = {
  type: "textReuploaded";
  header: {
    contentId: string;
  };
};

export type onApplicationUploadedToTableType = {
  type: "applicationUploadedToTable";
  header: {
    contentId: string;
    instanceId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
    initPositioning:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined;
  };
};

export type onApplicationUploadedToTabledType = {
  type: "applicationUploadedToTabled";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
  };
};

export type onApplicationReuploadedType = {
  type: "applicationReuploaded";
  header: {
    contentId: string;
  };
};

export type onSoundClipUploadedToTableType = {
  type: "soundClipUploadedToTable";
  header: {
    contentId: string;
    instanceId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
    initPositioning:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined;
  };
};

export type onSoundClipUploadedToTabledType = {
  type: "soundClipUploadedToTabled";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
    state: TableContentStateTypes[];
  };
};

export type onSoundClipReuploadedType = {
  type: "soundClipReuploaded";
  header: {
    contentId: string;
  };
};

export type onChunkType = {
  type: "chunk";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
    range: string;
  };
  data: {
    chunk: Uint8Array<any>;
  };
};

export type onChunkErrorType = {
  type: "chunkError";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
};

export type onDownloadMetaType = {
  type: "downloadMeta";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    fileSize: number;
  };
};

export type onOneShotDownloadType = {
  type: "oneShotDownload";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    buffer: Uint8Array<any>;
  };
};

export type onDownloadErrorType = {
  type: "downloadError";
  header: { contentType: StaticContentTypes; contentId: string };
};

export type onResponsedCatchUpTableDataType = {
  type: "responsedCatchUpTableData";
  data: {
    images:
      | {
          tableId: string;
          imageId: string;
          filename: string;
          mimeType: string;
          state: TableContentStateTypes[];
          instances: {
            imageInstanceId: string;
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
          }[];
        }[]
      | undefined;
    svgs:
      | {
          tableId: string;
          svgId: string;
          filename: string;
          mimeType: string;
          state: TableContentStateTypes[];
          instances: {
            svgInstanceId: string;
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
            effects: { [effectType in SvgEffectTypes]: boolean };
            effectStyles: SvgEffectStylesType;
          }[];
        }[]
      | undefined;
    videos:
      | {
          tableId: string;
          videoId: string;
          filename: string;
          mimeType: string;
          state: TableContentStateTypes[];
          instances: {
            videoInstanceId: string;
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
          }[];
        }[]
      | undefined;
    text:
      | {
          tableId: string;
          textId: string;
          filename: string;
          mimeType: string;
          state: TableContentStateTypes[];
          instances: {
            textInstanceId: string;
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
            effectStyles: TextEffectStylesType;
          }[];
        }[]
      | undefined;
    soundClips:
      | {
          tableId: string;
          soundClipId: string;
          filename: string;
          mimeType: string;
          state: TableContentStateTypes[];
          instances: {
            soundClipInstanceId: string;
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
          }[];
        }[]
      | undefined;
    applications:
      | {
          tableId: string;
          applicationId: string;
          filename: string;
          mimeType: string;
          state: TableContentStateTypes[];
          instances: {
            applicationInstanceId: string;
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
          }[];
        }[]
      | undefined;
  };
};

export type onContentDeletedType = {
  type: "contentDeleted";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
    instanceId: string;
  };
};

export type onContentStateChangedType = {
  type: "contentStateChanged";
  header: { contentType: StaticContentTypes; contentId: string };
  data: { state: TableContentStateTypes[] };
};

export type onUpdatedContentEffectsType = {
  type: "updatedContentEffects";
  header: {
    contentType: StaticContentTypes;
    contentId: string;
    instanceId: string;
  };
  data: {
    effects: {
      [effectType: string]: boolean;
    };
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
      | ApplicationEffectStylesType
      | SvgEffectStylesType
      | TextEffectStylesType;
  };
};

export type onUpdatedVideoPositionType = {
  type: "updatedVideoPosition";
  header: {
    contentType: "video";
    contentId: string;
    instanceId: string;
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
    instanceId: string;
  };
};

export type onRespondedCatchUpVideoPositionType = {
  type: "respondedCatchUpVideoPosition";
  header: {
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
  data: {
    currentVideoPosition: number;
  };
};

export type onCreatedNewInstancesType = {
  type: "createdNewInstances";
  data: {
    newInstances: {
      contentType: StaticContentTypes;
      contentId: string;
      instances: {
        instanceId: string;
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
      }[];
    }[];
  };
};

export type onSearchTabledContentRespondedType = {
  type: "searchTabledContentResponded";
  data: any;
};
