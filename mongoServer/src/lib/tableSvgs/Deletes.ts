import { Collection } from "mongodb";

class Deletes {
  constructor(private tableSvgsCollection: Collection) {}

  deleteMetaDataBy_TID_SID = async (table_id: string, svgId: string) => {
    try {
      await this.tableSvgsCollection.deleteOne({
        tid: table_id,
        sid: svgId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
