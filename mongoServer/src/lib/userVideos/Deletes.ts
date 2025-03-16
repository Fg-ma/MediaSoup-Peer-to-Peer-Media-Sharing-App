import { Collection } from "mongodb";

class Deletes {
  constructor(private userVideosCollection: Collection) {}

  deleteMetaDataBy_UID_VID = async (user_id: string, videoId: string) => {
    try {
      await this.userVideosCollection.deleteOne({
        uid: user_id,
        vid: videoId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
