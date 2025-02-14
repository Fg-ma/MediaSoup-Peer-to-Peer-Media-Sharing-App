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
}

export default Gets;
