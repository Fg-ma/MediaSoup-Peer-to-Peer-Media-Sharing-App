import { Collection } from "mongodb";
import { UserTextType } from "./typeConstant";

class Deletes {
  constructor(private userTextCollection: Collection<UserTextType>) {}

  deleteMetadataBy_UID_XID = async (userId: string, textId: string) => {
    try {
      await this.userTextCollection.deleteOne({
        uid: userId,
        xid: textId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
