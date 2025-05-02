import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateDecodingMap } from "../typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    uid: string;
    iid: string;
    n: string;
    m: string;
    s: number[];
  }): {
    userId: string;
    imageId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  } => {
    const { uid, iid, n, m, s } = data;

    return {
      userId: uid,
      imageId: iid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => userStateDecodingMap[ate]),
    };
  };
}

export default Decoder;
