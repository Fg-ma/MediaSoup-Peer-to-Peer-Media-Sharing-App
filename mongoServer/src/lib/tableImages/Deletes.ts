import { Collection } from "mongodb";
import { TableImagesType } from "./typeConstant";

class Deletes {
  constructor(private tableImagesCollection: Collection<TableImagesType>) {}

  deleteMetaDataBy_TID_IID = async (tableId: string, imageId: string) => {
    try {
      await this.tableImagesCollection.deleteOne({
        tid: tableId,
        iid: imageId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_IID_IIID = async (
    tableId: string,
    imageId: string,
    imageInstanceId: string
  ): Promise<null | TableImagesType> => {
    try {
      const result = await this.tableImagesCollection.findOneAndUpdate(
        {
          tid: tableId,
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
