import { Collection } from "mongodb";

class Deletes {
  constructor(private tableApplicationsCollection: Collection) {}

  deleteMetaDataBy_TID_AID = async (
    table_id: string,
    applicationId: string
  ) => {
    try {
      await this.tableApplicationsCollection.deleteOne({
        tid: table_id,
        aid: applicationId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
