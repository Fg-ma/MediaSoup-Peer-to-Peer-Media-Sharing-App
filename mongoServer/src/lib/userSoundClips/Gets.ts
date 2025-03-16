import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private userSoundClipsCollection: Collection,
    private decoder: Decoder
  ) {}

  getSoundClipMetaDataBy_UID_AID = async (
    user_id: string,
    soundClipId: string
  ) => {
    try {
      const soundClipData = await this.userSoundClipsCollection.findOne({
        tid: user_id,
        sid: soundClipId,
      });

      if (!soundClipData) {
        return null;
      }

      // @ts-expect-error: mongo doesn't have typing
      return this.decoder.decodeMetaData(soundClipData);
    } catch (err) {
      console.error("Error retrieving sound clip data:", err);
      return null;
    }
  };

  getAllBy_UID = async (user_id: string) => {
    try {
      const soundClipsData = await this.userSoundClipsCollection
        .find({ uid: user_id })
        .toArray();

      if (!soundClipsData || soundClipsData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return soundClipsData.map((data) =>
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
