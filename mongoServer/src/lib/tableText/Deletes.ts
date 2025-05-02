import { Collection } from "mongodb";
import { TableTextType } from "./typeConstant";

class Deletes {
  constructor(private tableTextCollection: Collection<TableTextType>) {}

  deleteMetaDataBy_TID_XID = async (tableId: string, textId: string) => {
    try {
      await this.tableTextCollection.deleteOne({
        tid: tableId,
        xid: textId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_XID_XIID = async (
    tableId: string,
    textId: string,
    textInstanceId: string
  ): Promise<null | TableTextType> => {
    try {
      const result = await this.tableTextCollection.findOneAndUpdate(
        {
          tid: tableId,
          xid: textId,
        },
        {
          $pull: {
            i: {
              xiid: textInstanceId,
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

      return result as TableTextType;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export default Deletes;
