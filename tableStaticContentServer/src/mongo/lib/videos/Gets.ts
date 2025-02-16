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

  getAllBy_TID = async (table_id: string) => {
    try {
      const videoData = await this.tableVideosCollection
        .find({ tid: table_id })
        .toArray();

      if (!videoData || videoData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return videoData.map((data) =>
        // @ts-expect-error: mongo doesn't have typing
        this.decoder.decodeMetaData(data)
      );
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
