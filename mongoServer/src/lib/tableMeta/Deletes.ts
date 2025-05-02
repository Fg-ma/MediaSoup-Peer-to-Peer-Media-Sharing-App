import { Collection } from "mongodb";

class Deletes {
  constructor(private tablesMetaCollection: Collection) {}

  deleteMetaDataBy_TID_VID = async (tableId: string) => {
    try {
      await this.tablesMetaCollection.deleteOne({
        tid: tableId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
