import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { UserSoundClipsType } from "./typeConstant";

class Gets {
  constructor(
    private userSoundClipsCollection: Collection<UserSoundClipsType>,
    private decoder: Decoder
  ) {}

  getSoundClipMetaDataBy_UID_AID = async (
    userId: string,
    soundClipId: string
  ) => {
    try {
      const soundClipData = await this.userSoundClipsCollection.findOne({
        tid: userId,
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

  getAllBy_UID = async (userId: string) => {
    try {
      const soundClipsData = await this.userSoundClipsCollection
        .find({ uid: userId })
        .toArray();

      if (!soundClipsData || soundClipsData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return soundClipsData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by UID:", err);
      return [];
    }
  };
}

export default Gets;
