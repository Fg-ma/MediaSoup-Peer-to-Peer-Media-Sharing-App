import { Collection } from "mongodb";
import { UserImagesType } from "./typeConstant";

class Deletes {
  constructor(private userImagesCollection: Collection<UserImagesType>) {}

  deleteMetaDataBy_UID_IID = async (userId: string, imageId: string) => {
    try {
      await this.userImagesCollection.deleteOne({
        uid: userId,
        iid: imageId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
