import { Collection } from "mongodb";

class Deletes {
  constructor(private userApplicationsCollection: Collection) {}

  deleteMetaDataBy_UID_AID = async (user_id: string, applicationId: string) => {
    try {
      await this.userApplicationsCollection.deleteOne({
        tid: user_id,
        aid: applicationId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
