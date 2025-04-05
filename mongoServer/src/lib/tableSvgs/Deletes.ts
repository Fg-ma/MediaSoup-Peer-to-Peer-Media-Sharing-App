import { Collection } from "mongodb";
import { TableSvgsType } from "./typeConstant";

class Deletes {
  constructor(private tableSvgsCollection: Collection<TableSvgsType>) {}

  deleteMetaDataBy_TID_SID = async (table_id: string, svgId: string) => {
    try {
      await this.tableSvgsCollection.deleteOne({
        tid: table_id,
        sid: svgId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_SID_SIID = async (
    table_id: string,
    svgId: string,
    svgInstanceId: string
  ): Promise<null | TableSvgsType> => {
    try {
      const result = await this.tableSvgsCollection.findOneAndUpdate(
        {
          tid: table_id,
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
