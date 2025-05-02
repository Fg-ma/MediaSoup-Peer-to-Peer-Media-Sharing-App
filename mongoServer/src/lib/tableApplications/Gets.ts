import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { TableApplicationsType } from "./typeConstant";

class Gets {
  constructor(
    private tableApplicationsCollection: Collection<TableApplicationsType>,
    private decoder: Decoder
  ) {}

  getApplicationMetaDataBy_TID_IID = async (
    tableId: string,
    applicationId: string
  ) => {
    try {
      const applicationData = await this.tableApplicationsCollection.findOne({
        tid: tableId,
        aid: applicationId,
      });

      if (!applicationData) {
        return null;
      }

      return this.decoder.decodeMetaData(applicationData);
    } catch (err) {
      console.error("Error retrieving vidoe data:", err);
      return null;
    }
  };

  getAllBy_TID = async (tableId: string) => {
    try {
      const applicationData = await this.tableApplicationsCollection
        .find({ tid: tableId })
        .toArray();

      if (!applicationData || applicationData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return applicationData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
