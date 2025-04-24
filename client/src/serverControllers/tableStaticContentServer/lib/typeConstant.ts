import {
  ContentStateTypes,
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
  | onGetFileType
  | onUpdateContentPositioningType
  | onUpdateContentEffectsType
  | onUpdateVideoPositionType
  | onRequestCatchUpVideoPositionType
  | onResponseCatchUpVideoPositionType
  | onChangeContentStateType
  | onCreateNewInstancesType
  | onSearchTabledContentRequestType;

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
    instanceId: string;
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
    table_id: string;
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
      | SvgEffectStylesType;
  };
};

type onUpdateVideoPositionType = {
  type: "updateVideoPosition";
  header: {
    table_id: string;
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
    table_id: string;
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
    table_id: string;
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
    table_id: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    state: ContentStateTypes[];
  };
};

type onCreateNewInstancesType = {
  type: "createNewInstances";
  header: {
    table_id: string;
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
    table_id: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes | "all";
    name: string;
  };
};

export type IncomingTableStaticContentMessages =
  | { type: undefined }
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
  | onDownloadCompleteType
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
    state: ContentStateTypes[];
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
          state: ContentStateTypes[];
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
          table_id: string;
          svgId: string;
          filename: string;
          mimeType: string;
          state: ContentStateTypes[];
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
          table_id: string;
          videoId: string;
          filename: string;
          mimeType: string;
          state: ContentStateTypes[];
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
          table_id: string;
          textId: string;
          filename: string;
          mimeType: string;
          state: ContentStateTypes[];
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
          }[];
        }[]
      | undefined;
    soundClips:
      | {
          table_id: string;
          soundClipId: string;
          filename: string;
          mimeType: string;
          state: ContentStateTypes[];
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
          table_id: string;
          applicationId: string;
          filename: string;
          mimeType: string;
          state: ContentStateTypes[];
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
  data: { state: ContentStateTypes[] };
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
      | SvgEffectStylesType;
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
