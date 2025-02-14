import { Collection } from "mongodb";

class Deletes {
  constructor(private tableTextsCollection: Collection) {}

  deleteMetaDataBy_TID_XID = async (table_id: string, textId: string) => {
    try {
      await this.tableTextsCollection.deleteOne({
        tid: table_id,
        xid: textId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
