import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { TableSoundClipsType } from "./typeConstant";

class Gets {
  constructor(
    private tableSoundClipsCollection: Collection<TableSoundClipsType>,
    private decoder: Decoder
  ) {}

  getSoundClipMetaDataBy_TID_AID = async (
    table_id: string,
    soundClipId: string
  ) => {
    try {
      const soundClipData = await this.tableSoundClipsCollection.findOne({
        tid: table_id,
        sid: soundClipId,
      });

      if (!soundClipData) {
        return null;
      }

      return this.decoder.decodeMetaData(soundClipData);
    } catch (err) {
      console.error("Error retrieving sound clip data:", err);
      return null;
    }
  };

  getAllBy_TID = async (table_id: string) => {
    try {
      const soundClipsData = await this.tableSoundClipsCollection
        .find({ tid: table_id })
        .toArray();

      if (!soundClipsData || soundClipsData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return soundClipsData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
