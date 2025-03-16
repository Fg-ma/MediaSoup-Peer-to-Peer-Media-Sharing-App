import { Collection } from "mongodb";

class Deletes {
  constructor(private tableSoundClipsCollection: Collection) {}

  deleteMetaDataBy_TID_AID = async (table_id: string, soundClipId: string) => {
    try {
      await this.tableSoundClipsCollection.deleteOne({
        tid: table_id,
        aid: soundClipId,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

export default Deletes;
