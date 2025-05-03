import { StaticContentTypes } from "../../../../../universal/contentTypeConstant";
import { InstanceLayerModes } from "../../../tableLayers/newInstancesLayer/lib/typeConstant";

export type GeneralSignals = onLocalMuteChangeType | onTableInfoSignalType;

export type NewInstanceSignals =
  | onStartInstancesDragType
  | onStopInstancesDragType
  | onInstancesLayerModeType;

export type GroupSignals =
  | onGroupDragStartType
  | onGroupDragType
  | onGroupDragEndType
  | onGroupDeleteType;

export type onLocalMuteChangeType = {
  type: "localMuteChange";
  header: {
    tableId: string;
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

export type onGroupDragStartType = {
  type: "groupDragStart";
  data: {
    affected: {
      type: string;
      id: string;
    }[];
    startDragPosition: {
      x: number;
      y: number;
    };
  };
};

export type onGroupDragType = {
  type: "groupDrag";
  data: {
    affected: {
      type: string;
      id: string;
    }[];
    dragPosition: {
      x: number;
      y: number;
    };
  };
};

export type onGroupDragEndType = {
  type: "groupDragEnd";
  data: {
    affected: {
      type: string;
      id: string;
    }[];
  };
};

export type onGroupDeleteType = {
  type: "groupDelete";
  data: {
    affected: {
      type: string;
      id: string;
    }[];
  };
};
