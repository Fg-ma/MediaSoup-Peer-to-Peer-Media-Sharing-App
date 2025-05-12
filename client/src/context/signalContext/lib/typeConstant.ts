import {
  ContentTypes,
  StaticContentTypes,
} from "../../../../../universal/contentTypeConstant";
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
  | onGroupDeleteType
  | onGroupChangeType
  | onClearGroupType
  | onGroupUpdateType
  | onGroupElementMoveType;

export type MediaPositioningSignals =
  | onMoveToType
  | onRotateToType
  | onScaleToType;

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
      type: ContentTypes;
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
      type: ContentTypes;
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
      type: ContentTypes;
      id: string;
    }[];
  };
};

export type onGroupDeleteType = {
  type: "groupDelete";
  data: {
    affected: {
      type: ContentTypes;
      id: string;
    }[];
  };
};

export type onGroupChangeType = {
  type: "groupChange";
  data: {
    selected: {
      type: ContentTypes;
      id: string;
    }[];
  };
};

export type onGroupUpdateType = {
  type: "groupUpdate";
};

export type onClearGroupType = {
  type: "clearGroup";
};

export type onGroupElementMoveType = {
  type: "groupElementMove";
  data: {
    contentType: ContentTypes;
    contentId: string;
  };
};

export type onMoveToType = {
  type: "moveTo";
  header: {
    contentId: string;
    contentType: ContentTypes;
  };
  data: {
    position: {
      x: number;
      y: number;
    };
  };
};

export type onRotateToType = {
  type: "rotateTo";
  header: {
    contentId: string;
    contentType: ContentTypes;
  };
  data: {
    rotation: number;
  };
};

export type onScaleToType = {
  type: "scaleTo";
  header: {
    contentId: string;
    contentType: ContentTypes;
  };
  data: {
    scale: {
      x: number;
      y: number;
    };
  };
};
