import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateEncodingMap } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    userId: string;
    imageId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }): {
    uid: string;
    iid: string;
    n: string;
    m: string;
    s: number[];
  } => {
    const { userId, imageId, filename, mimeType, state } = data;

    return {
      uid: userId,
      iid: imageId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => userStateEncodingMap[ate]),
    };
  };
}

export default Encoder;
