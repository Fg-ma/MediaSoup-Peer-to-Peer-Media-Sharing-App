import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateEncodingMap } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    userId: string;
    applicationId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }): {
    uid: string;
    aid: string;
    n: string;
    m: string;
    s: number[];
  } => {
    const { userId, applicationId, filename, mimeType, state } = data;

    return {
      uid: userId,
      aid: applicationId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => userStateEncodingMap[ate]),
    };
  };
}

export default Encoder;
