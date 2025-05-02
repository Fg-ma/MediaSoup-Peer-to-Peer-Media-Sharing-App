import { Collection } from "mongodb";
import { UserSoundClipsType } from "./typeConstant";

class Deletes {
  constructor(
    private userSoundClipsCollection: Collection<UserSoundClipsType>
  ) {}

  deleteMetaDataBy_UID_AID = async (userId: string, soundClipId: string) => {
    try {
      await this.userSoundClipsCollection.deleteOne({
        uid: userId,
        aid: soundClipId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
