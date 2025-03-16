import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private tableApplicationsCollection: Collection,
    private decoder: Decoder
  ) {}

  getApplicationMetaDataBy_TID_IID = async (
    table_id: string,
    applicationId: string
  ) => {
    try {
      const applicationData = await this.tableApplicationsCollection.findOne({
        tid: table_id,
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

  getAllBy_TID = async (table_id: string) => {
    try {
      const applicationData = await this.tableApplicationsCollection
        .find({ tid: table_id })
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
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
