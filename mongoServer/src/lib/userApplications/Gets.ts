import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { UserApplicationsType } from "./typeConstant";

class Gets {
  constructor(
    private userApplicationsCollection: Collection<UserApplicationsType>,
    private decoder: Decoder
  ) {}

  getApplicationMetadataBy_UID_IID = async (
    userId: string,
    applicationId: string
  ) => {
    try {
      const applicationData = await this.userApplicationsCollection.findOne({
        uid: userId,
        aid: applicationId,
      });

      if (!applicationData) {
        return null;
      }

      return this.decoder.decodeMetadata(applicationData);
    } catch (err) {
      console.error("Error retrieving vidoe data:", err);
      return null;
    }
  };

  getAllBy_UID = async (userId: string) => {
    try {
      const applicationData = await this.userApplicationsCollection
        .find({ uid: userId })
        .toArray();

      if (!applicationData || applicationData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return applicationData.map((data) => this.decoder.decodeMetadata(data));
    } catch (err) {
      console.error("Error retrieving data by UID:", err);
      return [];
    }
  };
}

export default Gets;
