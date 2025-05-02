import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { UserVideosType } from "./typeConstant";

class Gets {
  constructor(
    private userVideosCollection: Collection<UserVideosType>,
    private decoder: Decoder
  ) {}

  getVideoMetaDataBy_UID_IID = async (userId: string, videoId: string) => {
    try {
      const videoData = await this.userVideosCollection.findOne({
        uid: userId,
        vid: videoId,
      });

      if (!videoData) {
        return null;
      }

      return this.decoder.decodeMetaData(videoData);
    } catch (err) {
      console.error("Error retrieving vidoe data:", err);
      return null;
    }
  };

  getAllBy_UID = async (userId: string) => {
    try {
      const videoData = await this.userVideosCollection
        .find({ uid: userId })
        .toArray();

      if (!videoData || videoData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return videoData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by UID:", err);
      return [];
    }
  };
}

export default Gets;
