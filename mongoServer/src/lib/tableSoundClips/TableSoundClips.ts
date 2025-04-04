import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";
import { TableSoundClipsType } from "./typeConstant";

class TableSoundClips {
  private tableSoundClipsCollection: Collection<TableSoundClipsType>;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tableSoundClipsCollection = this.db.collection("tableSoundClips");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tableSoundClipsCollection, this.decoder);
    this.uploads = new Uploads(this.tableSoundClipsCollection, this.encoder);
    this.deletes = new Deletes(this.tableSoundClipsCollection);
  }
}

export default TableSoundClips;
