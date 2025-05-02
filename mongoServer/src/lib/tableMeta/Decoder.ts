import { tableColorDecodingMap, TableColors } from "../typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
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
  }): {
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
  } => {
    const { tid, tn, ow, mm, io, bm, bi } = data;

    return {
      tableId: tid,
      tableName: tn,
      owner: ow,
      members: mm.map((member) => ({
        memberId: member.mid,
        permissions: {
          read: member.p.r,
          write: member.p.w,
          delete: member.p.d,
        },
        seat: member.s,
        online: member.o,
        priority: member.pr,
        color: tableColorDecodingMap[member.c],
      })),
      interactionOrder: io,
      backgroundMedia: bm,
      backgroundImage: bi,
    };
  };
}

export default Decoder;
