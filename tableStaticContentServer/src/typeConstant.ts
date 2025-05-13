import uWS from "uWebSockets.js";
import { onUpdateVideoPositionType } from "../../mongoServer/src/typeConstant";
import {
  TableContentStateTypes,
  StaticContentTypes,
} from "../../universal/contentTypeConstant";
import {
  ApplicationEffectStylesType,
  ImageEffectStylesType,
  SvgEffectStylesType,
  VideoEffectStylesType,
} from "../../universal/effectsTypeConstant";

export interface Tables {
  [tableId: string]: {
    [username: string]: {
      [instance: string]: TableStaticContentWebSocket;
    };
  };
}

export const contentTypeBucketMap: {
  [staticContentType in StaticContentTypes]: string;
} = {
  video: "table-videos",
  image: "table-images",
  svg: "table-svgs",
  application: "table-applications",
  text: "table-text",
  soundClip: "table-sound-clips",
};

export const contentTypeQdrantMap: {
  [staticContentType in StaticContentTypes]: string;
} = {
  video: "tableVideos",
  image: "tableImages",
  svg: "tableSvgs",
  application: "tableApplications",
  text: "tableText",
  soundClip: "tableSoundClips",
};

export interface TableStaticContentWebSocket extends uWS.WebSocket<SocketData> {
  id: string;
  tableId: string;
  username: string;
  instance: string;
}

export interface SocketData {
  id: string;
  tableId: string;
  username: string;
  instance: string;
}

export type MessageTypes =
  | onJoinTableType
  | onLeaveTableType
  | onRequestCatchUpTableDataType
  | onDeleteContentType
  | onGetFileType
  | onPauseDownloadType
  | onResumeDownloadType
  | onCancelDownloadType
  | onUpdateContentPositioningType
  | onUpdateContentEffectsType
  | onUpdateVideoPositionType
  | onRequestCatchUpVideoPositionType
  | onResponseCatchUpVideoPositionType
  | onChangeContentStateType
  | onCreateNewInstancesType
  | onSearchTabledContentRequestType;

export type onSearchTabledContentRequestType = {
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

export type onJoinTableType = {
  type: "joinTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

export type onLeaveTableType = {
  type: "leaveTable";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

export type onRequestCatchUpTableDataType = {
  type: "requestCatchUpTableData";
  header: {
    tableId: string;
    username: string;
    instance: string;
  };
};

export type onDeleteContentType = {
  type: "deleteContent";
  header: {
    tableId: string;
    contentType: StaticContentTypes;
    contentId: string;
    instanceId: string;
  };
};

export type onGetFileType = {
  type: "getFile";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentType: StaticContentTypes;
    contentId: string;
  };
};

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
      | SvgEffectStylesType;
  };
};

export type onRequestCatchUpVideoPositionType = {
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

export type onResponseCatchUpVideoPositionType = {
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

export type onChangeContentStateType = {
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

export type onPauseDownloadType = {
  type: "pauseDownload";
  header: { downloadId: string };
};

export type onResumeDownloadType = {
  type: "resumeDownload";
  header: { downloadId: string };
};

export type onCancelDownloadType = {
  type: "cancelDownload";
  header: { downloadId: string };
};

export const tables: Tables = {};
