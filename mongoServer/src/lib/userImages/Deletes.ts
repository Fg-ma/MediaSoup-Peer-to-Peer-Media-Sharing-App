import { Collection } from "mongodb";

class Deletes {
  constructor(private userImagesCollection: Collection) {}

  deleteMetaDataBy_UID_IID = async (user_id: string, imageId: string) => {
    try {
      await this.userImagesCollection.deleteOne({
        tid: user_id,
        iid: imageId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
