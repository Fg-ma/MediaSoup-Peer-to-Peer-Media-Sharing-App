import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";

class TableAudio {
  private tableAudioCollection: Collection;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.tableAudioCollection = this.db.collection("tableAudio");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.tableAudioCollection, this.decoder);
    this.uploads = new Uploads(this.tableAudioCollection, this.encoder);
    this.deletes = new Deletes(this.tableAudioCollection);
  }
}

export default TableAudio;
