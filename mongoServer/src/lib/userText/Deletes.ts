import { Collection } from "mongodb";

class Deletes {
  constructor(private userTextCollection: Collection) {}

  deleteMetaDataBy_UID_XID = async (user_id: string, textId: string) => {
    try {
      await this.userTextCollection.deleteOne({
        uid: user_id,
        xid: textId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
