import { Collection } from "mongodb";

class Deletes {
  constructor(private tableVideosCollection: Collection) {}

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
}

export default Deletes;
