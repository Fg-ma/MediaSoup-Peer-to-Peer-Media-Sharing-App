import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { TableVideosType } from "./typeConstant";

class Gets {
  constructor(
    private tableVideosCollection: Collection<TableVideosType>,
    private decoder: Decoder
  ) {}

  getVideoMetadataBy_TID_VID = async (tableId: string, videoId: string) => {
    try {
      const videoData = await this.tableVideosCollection.findOne({
        tid: tableId,
        vid: videoId,
      });

      if (!videoData) {
        return null;
      }

      return this.decoder.decodeMetadata(videoData);
    } catch (err) {
      console.error("Error retrieving vidoe data:", err);
      return null;
    }
  };

  getAllBy_TID = async (tableId: string) => {
    try {
      const videoData = await this.tableVideosCollection
        .find({ tid: tableId })
        .toArray();

      if (!videoData || videoData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return videoData.map((data) => this.decoder.decodeMetadata(data));
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
