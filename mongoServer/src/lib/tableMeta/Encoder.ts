import { tableColorEncodingMap, TableColors } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    tableId: string;
    tableName: string;
    owner: string;
    members: {
      memberId: string;
      permissions: {
        read: boolean;
        write: boolean;
        delete: boolean;
      };
      seat: number;
      online: boolean;
      priority: number;
      color: TableColors;
    }[];
    interactionOrder: string[];
    backgroundMedia: string | null;
    backgroundImage: string | null;
  }): {
    tid: string;
    tn: string;
    ow: string;
    mm: {
      mid: string;
      p: {
        r: boolean;
        w: boolean;
        d: boolean;
      };
      s: number;
      o: boolean;
      pr: number;
      c: number;
    }[];
    io: string[];
    bm: string | null;
    bi: string | null;
  } => {
    const {
      tableId,
      tableName,
      owner,
      members,
      interactionOrder,
      backgroundMedia,
      backgroundImage,
    } = data;

    return {
      tid: tableId,
      tn: tableName,
      ow: owner,
      mm: members.map((member) => ({
        mid: member.memberId,
        p: {
          r: member.permissions.read,
          w: member.permissions.write,
          d: member.permissions.delete,
        },
        s: member.seat,
        o: member.online,
        pr: member.priority,
        c: tableColorEncodingMap[member.color],
      })),
      io: interactionOrder,
      bm: backgroundMedia,
      bi: backgroundImage,
    };
  };
}

export default Encoder;
