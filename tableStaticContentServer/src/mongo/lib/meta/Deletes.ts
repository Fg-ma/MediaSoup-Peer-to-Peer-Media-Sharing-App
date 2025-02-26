import { Collection } from "mongodb";

class Deletes {
  constructor(private tablesMetaCollection: Collection) {}

  deleteMetaDataBy_TID_VID = async (table_id: string) => {
    try {
      await this.tablesMetaCollection.deleteOne({
        tid: table_id,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
