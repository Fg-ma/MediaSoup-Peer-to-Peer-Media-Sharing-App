import { Collection } from "mongodb";
import { UserVideosType } from "./typeConstant";

class Deletes {
  constructor(private userVideosCollection: Collection<UserVideosType>) {}

  deleteMetaDataBy_UID_VID = async (userId: string, videoId: string) => {
    try {
      await this.userVideosCollection.deleteOne({
        uid: userId,
        vid: videoId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
