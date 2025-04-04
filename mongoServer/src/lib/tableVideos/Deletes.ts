import { Collection } from "mongodb";
import { TableVideosType } from "./typeConstant";

class Deletes {
  constructor(private tableVideosCollection: Collection<TableVideosType>) {}

  deleteMetaDataBy_TID_VID = async (table_id: string, videoId: string) => {
    try {
      await this.tableVideosCollection.deleteOne({
        tid: table_id,
        vid: videoId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  deleteInstanceBy_TID_VID_VIID = async (
    table_id: string,
    videoId: string,
    videoInstanceId: string
  ): Promise<null | TableVideosType> => {
    try {
      const result = await this.tableVideosCollection.findOneAndUpdate(
        {
          tid: table_id,
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

      // @ts-expect-error weird
      if (!result || !result.value) {
        return null;
      }

      // @ts-expect-error weird
      return result.value as TableVideosType;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export default Deletes;
