import { Collection } from "mongodb";
import { TableVideosType } from "./typeConstant";

class Deletes {
  constructor(private tableVideosCollection: Collection<TableVideosType>) {}

  deleteMetaDataBy_TID_VID = async (tableId: string, videoId: string) => {
    try {
      await this.tableVideosCollection.deleteOne({
        tid: tableId,
        vid: videoId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_VID_VIID = async (
    tableId: string,
    videoId: string,
    videoInstanceId: string
  ): Promise<null | TableVideosType> => {
    try {
      const result = await this.tableVideosCollection.findOneAndUpdate(
        {
          tid: tableId,
          vid: videoId,
        },
        {
          $pull: {
            i: {
              viid: videoInstanceId,
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

      return result as TableVideosType;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export default Deletes;
