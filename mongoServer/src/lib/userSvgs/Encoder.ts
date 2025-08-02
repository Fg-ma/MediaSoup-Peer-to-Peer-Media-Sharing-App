import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateEncodingMap } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetadata = (data: {
    userId: string;
    svgId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }): {
    uid: string;
    sid: string;
    n: string;
    m: string;
    s: number[];
  } => {
    const { userId, svgId, filename, mimeType, state } = data;

    return {
      uid: userId,
      sid: svgId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => userStateEncodingMap[ate]),
    };
  };
}

export default Encoder;
