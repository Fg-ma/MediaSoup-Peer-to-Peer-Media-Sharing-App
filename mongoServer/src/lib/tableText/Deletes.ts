import { Collection } from "mongodb";
import { TableTextType } from "./typeConstant";

class Deletes {
  constructor(private tableTextCollection: Collection<TableTextType>) {}

  deleteMetaDataBy_TID_XID = async (table_id: string, textId: string) => {
    try {
      await this.tableTextCollection.deleteOne({
        tid: table_id,
        xid: textId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_XID_XIID = async (
    table_id: string,
    textId: string,
    textInstanceId: string
  ): Promise<null | TableTextType> => {
    try {
      const result = await this.tableTextCollection.findOneAndUpdate(
        {
          tid: table_id,
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

      // @ts-expect-error weird
      if (!result || !result.value) {
        return null;
      }

      // @ts-expect-error weird
      return result.value as TableTextType;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export default Deletes;
