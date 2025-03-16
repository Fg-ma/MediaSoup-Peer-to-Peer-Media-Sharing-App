import { Collection } from "mongodb";

class Deletes {
  constructor(private userSoundClipsCollection: Collection) {}

  deleteMetaDataBy_UID_AID = async (user_id: string, soundClipId: string) => {
    try {
      await this.userSoundClipsCollection.deleteOne({
        uid: user_id,
        aid: soundClipId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
