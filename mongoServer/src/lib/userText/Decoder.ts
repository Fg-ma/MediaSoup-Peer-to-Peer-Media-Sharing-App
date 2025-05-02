import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateDecodingMap } from "../typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    uid: string;
    xid: string;
    n: string;
    m: string;
    s: number[];
  }): {
    userId: string;
    textId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  } => {
    const { uid, xid, n, m, s } = data;

    return {
      userId: uid,
      textId: xid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => userStateDecodingMap[ate]),
    };
  };
}

export default Decoder;
