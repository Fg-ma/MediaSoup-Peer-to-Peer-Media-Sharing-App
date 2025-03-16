import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";

class UserSvgs {
  private userSvgsCollection: Collection;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.userSvgsCollection = this.db.collection("userSvgs");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.userSvgsCollection, this.decoder);
    this.uploads = new Uploads(this.userSvgsCollection, this.encoder);
    this.deletes = new Deletes(this.userSvgsCollection);
  }
}

export default UserSvgs;
