import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private tableAudioCollection: Collection,
    private decoder: Decoder
  ) {}

  getAudioMetaDataBy_TID_AID = async (table_id: string, audioId: string) => {
    try {
      const audioData = await this.tableAudioCollection.findOne({
        tid: table_id,
        aid: audioId,
      });

      if (!audioData) {
        return null;
      }

      // @ts-expect-error: mongo doesn't have typing
      return this.decoder.decodeMetaData(audioData);
    } catch (err) {
      console.error("Error retrieving audio data:", err);
      return null;
    }
  };
}

export default Gets;
