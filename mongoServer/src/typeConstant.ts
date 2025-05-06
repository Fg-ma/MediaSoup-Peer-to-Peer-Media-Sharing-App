import {
  ApplicationEffectStylesType,
  ImageEffectStylesType,
  SvgEffectStylesType,
  VideoEffectStylesType,
} from "../../universal/effectsTypeConstant";
import {
  TableContentStateTypes,
  StaticContentTypes,
  UserContentStateTypes,
} from "../../universal/contentTypeConstant";

export type TableTopStaticMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "image/svg+xml"
  | "image/bmp"
  | "image/tiff"
  | "video/mp4"
  | "video/mpeg"
  | "video/webm"
  | "video/ogg"
  | "video/x-msvideo"
  | "audio/mpeg"
  | "audio/ogg"
  | "audio/wav"
  | "audio/webm"
  | "application/pdf"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain";

export type onUpdateContentPositioningType = {
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

export type onUpdateContentEffectsType = {
  type: "updateContentEffects";
  header: {
    tableId: string;
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
      | ApplicationEffectStylesType;
  };
};

export type onUpdateVideoPositionType = {
  type: "updateVideoPosition";
  header: {
    tableId: string;
    contentType: "video";
    contentId: string;
    instanceId: string;
  };
  data: { videoPosition: number };
};

export type onChangeTableContentStateType = {
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

export type onChangeUserContentStateType = {
  type: "changeContentState";
  header: {
    userId: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
  data: {
    state: UserContentStateTypes[];
  };
};

export type onCreateNewInstancesType = {
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
