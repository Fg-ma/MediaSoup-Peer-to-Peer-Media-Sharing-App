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
      if (!result) {
        return null;
      }

      return result as TableImagesType;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export default Deletes;
