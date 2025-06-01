import { TableSidePanels } from "../../../tableSidePanel/TableSidePanel";
import {
  ContentTypes,
  StaticContentTypes,
} from "../../../../../universal/contentTypeConstant";
import { InstanceLayerModes } from "../../../tableLayers/newInstancesLayer/lib/typeConstant";

export type GeneralSignals = onLocalMuteChangeType | onTableInfoSignalType;

export type SettingsSignals =
  | onToggleSettingsPanelType
  | onSidePanelChangedType
  | onRequestSidePanelStateType
  | onRespondedSidePanelStateType
  | onSidePanelClosedType
  | onSidePanelOpenedType;

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

export type onRequestSidePanelStateType = {
  type: "requestSidePanelState";
  header: {
    contentType: ContentTypes;
    instanceId: string;
  };
};

export type onRespondedSidePanelStateType = {
  type: "respondedSidePanelState";
  header: {
    contentType: ContentTypes;
    instanceId: string;
    activePanel: TableSidePanels;
  };
};

export type onSidePanelOpenedType = {
  type: "sidePanelOpened";
  header: {
    activePanel: TableSidePanels;
  };
};

export type onSidePanelClosedType = {
  type: "sidePanelClosed";
};

export type onSidePanelChangedType = {
  type: "sidePanelChanged";
  header: {
    activePanel: TableSidePanels;
    currentSettingsActive:
      | {
          contentType: ContentTypes;
          instanceId: string;
        }
      | undefined;
  };
};

export type onToggleSettingsPanelType = {
  type: "toggleSettingsPanel";
  header: {
    contentType: ContentTypes;
    instanceId: string;
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
    instanceId: string;
  };
};

export type onMoveToType = {
  type: "moveTo";
  header: {
    instanceId: string;
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
    instanceId: string;
    contentType: ContentTypes;
  };
  data: {
    rotation: number;
  };
};

export type onScaleToType = {
  type: "scaleTo";
  header: {
    instanceId: string;
    contentType: ContentTypes;
  };
  data: {
    scale: {
      x: number;
      y: number;
    };
  };
};
