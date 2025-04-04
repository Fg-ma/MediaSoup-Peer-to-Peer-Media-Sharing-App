import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { TableSvgsType } from "./typeConstant";

class Gets {
  constructor(
    private tableSvgsCollection: Collection<TableSvgsType>,
    private decoder: Decoder
  ) {}

  getSvgMetaDataBy_TID_SID = async (table_id: string, svgId: string) => {
    try {
      const svgData = await this.tableSvgsCollection.findOne({
        tid: table_id,
        sid: svgId,
      });

      if (!svgData) {
        return null;
      }

      return this.decoder.decodeMetaData(svgData);
    } catch (err) {
      console.error("Error retrieving svg data:", err);
      return null;
    }
  };

  getAllBy_TID = async (table_id: string) => {
    try {
      const svgData = await this.tableSvgsCollection
        .find({ tid: table_id })
        .toArray();

      if (!svgData || svgData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return svgData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
