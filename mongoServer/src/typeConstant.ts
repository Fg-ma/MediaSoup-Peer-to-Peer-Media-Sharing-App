import {
  ApplicationEffectStylesType,
  ImageEffectStylesType,
  SvgEffectStylesType,
  TextEffectStylesType,
  VideoEffectStylesType,
} from "../../universal/effectsTypeConstant";
import {
  TableContentStateTypes,
  StaticContentTypes,
  UserContentStateTypes,
} from "../../universal/contentTypeConstant";

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
