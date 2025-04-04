import { Collection } from "mongodb";
import { TableImagesType } from "./typeConstant";

class Deletes {
  constructor(private tableImagesCollection: Collection<TableImagesType>) {}

  deleteMetaDataBy_TID_IID = async (table_id: string, imageId: string) => {
    try {
      await this.tableImagesCollection.deleteOne({
        tid: table_id,
        iid: imageId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_IID_IIID = async (
    table_id: string,
    imageId: string,
    imageInstanceId: string
  ): Promise<null | TableImagesType> => {
    try {
      const result = await this.tableImagesCollection.findOneAndUpdate(
        {
          tid: table_id,
          iid: imageId,
        },
        {
          $pull: {
            i: {
              iiid: imageInstanceId,
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
      return result.value as TableImagesType;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export default Deletes;
