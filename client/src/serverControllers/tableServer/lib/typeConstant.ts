import { FgBackground } from "src/elements/fgBackgroundSelector/lib/typeConstant";
import { ContentTypes } from "../../../../../universal/contentTypeConstant";
import {
  TableReactions,
  TableReactionStyles,
} from "../../../../../universal/reactionsTypeConstant";

export type TableColors =
  | "cyan"
  | "orange"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "pink"
  | "black"
  | "white"
  | "brown"
  | "lime"
  | "coral"
  | "gray"
  | "navy"
  | "lightBlue"
  | "tableTop";

export type OutGoingTableMessages =
  | onJoinTableType
  | onLeaveTableType
  | onChangeTableBackgroundType
  | onMoveSeatsType
  | onSwapSeatsType
  | onKickFromTableType
  | onReactionType;

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

type onChangeTableBackgroundType = {
  type: "changeTableBackground";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: { background: FgBackground };
};

type onMoveSeatsType = {
  type: "moveSeats";
  header: {
    table_id: string;
    username: string;
  };
  data: { direction: "left" | "right" };
};

type onSwapSeatsType = {
  type: "swapSeats";
  header: {
    table_id: string;
    username: string;
    targetUsername: string;
  };
};

type onKickFromTableType = {
  type: "kickFromTable";
  header: {
    table_id: string;
    username: string;
    targetUsername: string;
  };
};

type onReactionType = {
  type: "reaction";
  header: {
    table_id: string;
    contentType: ContentTypes;
    contentId: string | undefined;
    instanceId: string | undefined;
  };
  data: { reaction: TableReactions; reactionStyle: TableReactionStyles };
};

export type IncomingTableMessages =
  | onTableBackgroundChangedType
  | onUserJoinedTableType
  | onUserLeftTableType
  | onSeatsMovedType
  | onSeatsSwapedType
  | onKickedFromTableType
  | onReactionOccurredType;

export type onTableBackgroundChangedType = {
  type: "tableBackgroundChanged";
  data: { background: FgBackground };
};

export type onUserJoinedTableType = {
  type: "userJoinedTable";
  data: {
    userData: {
      [username: string]: { color: TableColors; seat: number; online: boolean };
    };
  };
};

export type onUserLeftTableType = {
  type: "userLeftTable";
  data: {
    userData: {
      [username: string]: { color: TableColors; seat: number; online: boolean };
    };
  };
};

export type onSeatsMovedType = {
  type: "seatsMoved";
  data: {
    userData: {
      [username: string]: { color: TableColors; seat: number; online: boolean };
    };
  };
};

export type onSeatsSwapedType = {
  type: "seatsSwaped";
  data: {
    userData: {
      [username: string]: { color: TableColors; seat: number; online: boolean };
    };
  };
};

export type onKickedFromTableType = {
  type: "kickedFromTable";
  data: {
    userData: {
      [username: string]: { color: TableColors; seat: number; online: boolean };
    };
  };
};

export type onReactionOccurredType = {
  type: "reactionOccurred";
  header: {
    contentType: ContentTypes;
    contentId: string | undefined;
    instanceId: string | undefined;
  };
  data: {
    reaction: TableReactions;
    reactionStyle: TableReactionStyles;
  };
};
