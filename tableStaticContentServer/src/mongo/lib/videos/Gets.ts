import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private tableVideosCollection: Collection,
    private decoder: Decoder
  ) {}

  getVideoMetaDataBy_TID_IID = async (table_id: string, videoId: string) => {
    try {
      const videoData = await this.tableVideosCollection.findOne({
        tid: table_id,
        vid: videoId,
      });

      if (!videoData) {
        return null;
      }

      // @ts-expect-error: mongo doesn't have typing
      return this.decoder.decodeMetaData(videoData);
    } catch (err) {
      console.error("Error retrieving vidoe data:", err);
      return null;
    }
  };
}

export default Gets;
