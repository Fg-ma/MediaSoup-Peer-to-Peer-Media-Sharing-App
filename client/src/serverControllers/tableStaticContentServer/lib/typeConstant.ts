import { StaticContentTypes } from "../../../../../universal/typeConstant";
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
  | onUpdatedContentEffectsType
  | onUpdatedVideoPositionType
  | onRequestedCatchUpVideoPositionType
  | onRespondedCatchUpVideoPositionType;

export type onVideoUploadedToTableType = {
  type: "videoUploadedToTable";
  header: {
    contentId: string;
    instanceId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
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
          tabled: boolean;
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
          tabled: boolean;
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
          tabled: boolean;
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
          tabled: boolean;
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
          tabled: boolean;
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
          tabled: boolean;
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
