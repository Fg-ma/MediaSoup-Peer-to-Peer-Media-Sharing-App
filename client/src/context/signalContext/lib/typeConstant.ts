import { StaticContentTypes } from "../../../../../universal/contentTypeConstant";
import { InstanceLayerModes } from "../../../fgTableLayers/newInstancesLayer/lib/typeConstant";

export type Signals =
  | onLocalMuteChangeType
  | onStartInstancesDragType
  | onStopInstancesDragType
  | onInstancesLayerModeType
  | onTableInfoSignalType;

export type onLocalMuteChangeType = {
  type: "localMuteChange";
  header: {
    table_id: string;
    username: string;
    instance: string;
    producerType: "audio" | "screenAudio";
    producerId: string | undefined;
  };
};

export type onStartInstancesDragType = {
  type: "startInstancesDrag";
  data: {
    instances: {
      contentType: StaticContentTypes;
      contentId: string;
      instances: {
        width: number;
        height: number;
      }[];
    }[];
  };
};

export type onStopInstancesDragType = {
  type: "stopInstancesDrag";
};

export type onInstancesLayerModeType = {
  type: "instancesLayerMode";
  data: {
    mode: InstanceLayerModes;
  };
};

export type onTableInfoSignalType = {
  type: "tableInfoSignal";
  data: {
    message: string;
    timeout: number;
  };
};
