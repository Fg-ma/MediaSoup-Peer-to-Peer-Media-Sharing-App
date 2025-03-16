import { Collection } from "mongodb";

class Deletes {
  constructor(private userSvgsCollection: Collection) {}

  deleteMetaDataBy_UID_SID = async (user_id: string, svgId: string) => {
    try {
      await this.userSvgsCollection.deleteOne({
        uid: user_id,
        sid: svgId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
