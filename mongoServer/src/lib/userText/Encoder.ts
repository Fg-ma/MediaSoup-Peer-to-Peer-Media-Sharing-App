import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateEncodingMap } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    userId: string;
    textId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }): {
    uid: string;
    xid: string;
    n: string;
    m: string;
    s: number[];
  } => {
    const { userId, textId, filename, mimeType, state } = data;

    return {
      uid: userId,
      xid: textId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => userStateEncodingMap[ate]),
    };
  };
}

export default Encoder;
