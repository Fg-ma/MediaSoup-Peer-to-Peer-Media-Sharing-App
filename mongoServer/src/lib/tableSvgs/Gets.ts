import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { TableSvgsType } from "./typeConstant";

class Gets {
  constructor(
    private tableSvgsCollection: Collection<TableSvgsType>,
    private decoder: Decoder
  ) {}

  getSvgMetadataBy_TID_SID = async (tableId: string, svgId: string) => {
    try {
      const svgData = await this.tableSvgsCollection.findOne({
        tid: tableId,
        sid: svgId,
      });

      if (!svgData) {
        return null;
      }

      return this.decoder.decodeMetadata(svgData);
    } catch (err) {
      console.error("Error retrieving svg data:", err);
      return null;
    }
  };

  getAllBy_TID = async (tableId: string) => {
    try {
      const svgData = await this.tableSvgsCollection
        .find({ tid: tableId })
        .toArray();

      if (!svgData || svgData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return svgData.map((data) => this.decoder.decodeMetadata(data));
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
