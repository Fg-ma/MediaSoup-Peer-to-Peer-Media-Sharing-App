import { Collection } from "mongodb";

class Deletes {
  constructor(private tableAudioCollection: Collection) {}

  deleteMetaDataBy_TID_AID = async (table_id: string, audioId: string) => {
    try {
      await this.tableAudioCollection.deleteOne({
        tid: table_id,
        aid: audioId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
