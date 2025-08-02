import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateEncodingMap } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetadata = (data: {
    userId: string;
    soundClipId: string;
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
    const { userId, soundClipId, filename, mimeType, state } = data;

    return {
      uid: userId,
      sid: soundClipId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => userStateEncodingMap[ate]),
    };
  };
}

export default Encoder;
