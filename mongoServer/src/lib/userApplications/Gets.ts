import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private userApplicationsCollection: Collection,
    private decoder: Decoder
  ) {}

  getApplicationMetaDataBy_UID_IID = async (
    user_id: string,
    applicationId: string
  ) => {
    try {
      const applicationData = await this.userApplicationsCollection.findOne({
        uid: user_id,
        aid: applicationId,
      });

      if (!applicationData) {
        return null;
      }

      // @ts-expect-error: mongo doesn't have typing
      return this.decoder.decodeMetaData(applicationData);
    } catch (err) {
      console.error("Error retrieving vidoe data:", err);
      return null;
    }
  };

  getAllBy_UID = async (user_id: string) => {
    try {
      const applicationData = await this.userApplicationsCollection
        .find({ uid: user_id })
        .toArray();

      if (!applicationData || applicationData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return applicationData.map((data) =>
        // @ts-expect-error: mongo doesn't have typing
        this.decoder.decodeMetaData(data)
      );
    } catch (err) {
      console.error("Error retrieving data by UID:", err);
      return [];
    }
  };
}

export default Gets;
