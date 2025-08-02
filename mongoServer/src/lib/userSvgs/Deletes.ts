import { Collection } from "mongodb";
import { UserSvgsType } from "./typeConstant";

class Deletes {
  constructor(private userSvgsCollection: Collection<UserSvgsType>) {}

  deleteMetadataBy_UID_SID = async (userId: string, svgId: string) => {
    try {
      await this.userSvgsCollection.deleteOne({
        uid: userId,
        sid: svgId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
