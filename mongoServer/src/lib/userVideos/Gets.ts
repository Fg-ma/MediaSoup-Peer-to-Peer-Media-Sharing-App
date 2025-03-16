import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private userVideosCollection: Collection,
    private decoder: Decoder
  ) {}

  getVideoMetaDataBy_UID_IID = async (user_id: string, videoId: string) => {
    try {
      const videoData = await this.userVideosCollection.findOne({
        uid: user_id,
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

  getAllBy_UID = async (user_id: string) => {
    try {
      const videoData = await this.userVideosCollection
        .find({ uid: user_id })
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
      console.error("Error retrieving data by UID:", err);
      return [];
    }
  };
}

export default Gets;
