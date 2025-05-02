import { Collection } from "mongodb";
import { UserApplicationsType } from "./typeConstant";

class Deletes {
  constructor(
    private userApplicationsCollection: Collection<UserApplicationsType>
  ) {}

  deleteMetaDataBy_UID_AID = async (userId: string, applicationId: string) => {
    try {
      await this.userApplicationsCollection.deleteOne({
        uid: userId,
        aid: applicationId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
