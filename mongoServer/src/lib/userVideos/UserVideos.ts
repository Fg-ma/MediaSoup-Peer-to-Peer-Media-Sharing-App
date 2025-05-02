import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";
import { UserVideosType } from "./typeConstant";

class UserVideos {
  private userVideosCollection: Collection<UserVideosType>;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.userVideosCollection = this.db.collection("userVideos");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.userVideosCollection, this.decoder);
    this.uploads = new Uploads(this.userVideosCollection, this.encoder);
    this.deletes = new Deletes(this.userVideosCollection);
  }
}

export default UserVideos;
