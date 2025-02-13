import { Collection } from "mongodb";

class Deletes {
  constructor(private tableImagesCollection: Collection) {}

  deleteMetaDataBy_TID_IID = async (table_id: string, imageId: string) => {
    try {
      await this.tableImagesCollection.deleteOne({
        tid: table_id,
        iid: imageId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
