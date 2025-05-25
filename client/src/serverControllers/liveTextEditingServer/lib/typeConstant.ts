export type OutGoingLiveTextEditingMessages =
  | onJoinTableType
  | onLeaveTableType
  | onGetInitialDocStateType
  | onDocUpdateType
  | onDocSaveType;

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

type onGetInitialDocStateType = {
  type: "getInitialDocState";
  header: {
    tableId: string;
    username: string;
    instance: string;
    contentId: string;
  };
};

type onDocUpdateType = {
  type: "docUpdate";
  header: { tableId: string; contentId: string };
  data: {
    payload: any;
  };
};

type onDocSaveType = {
  type: "docSave";
  header: {
    tableId: string;
    contentId: string;
  };
};

export type IncomingLiveTextEditingMessages =
  | onDocUpdatedType
  | onDocSavedType
  | onInitialDocResponded;

export type onDocUpdatedType = {
  type: "docUpdated";
  header: { contentId: string };
  data: { payload: Uint8Array<ArrayBuffer> };
};

export type onDocSavedType = {
  type: "docSaved";
  header: { contentId: string };
};

export type onInitialDocResponded = {
  type: "initialDocResponded";
  header: { contentId: string };
  data: {
    payload: Uint8Array<ArrayBuffer>;
  };
};
