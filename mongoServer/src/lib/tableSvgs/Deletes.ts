import { Collection } from "mongodb";
import { TableSvgsType } from "./typeConstant";

class Deletes {
  constructor(private tableSvgsCollection: Collection<TableSvgsType>) {}

  deleteMetadataBy_TID_SID = async (tableId: string, svgId: string) => {
    try {
      await this.tableSvgsCollection.deleteOne({
        tid: tableId,
        sid: svgId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_SID_SIID = async (
    tableId: string,
    svgId: string,
    svgInstanceId: string
  ): Promise<null | TableSvgsType> => {
    try {
      const result = await this.tableSvgsCollection.findOneAndUpdate(
        {
          tid: tableId,
          sid: svgId,
        },
        {
          $pull: {
            i: {
              siid: svgInstanceId,
            },
          },
        },
        {
          returnDocument: "after",
        }
      );

      if (!result) {
        return null;
      }

      return result as TableSvgsType;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export default Deletes;
