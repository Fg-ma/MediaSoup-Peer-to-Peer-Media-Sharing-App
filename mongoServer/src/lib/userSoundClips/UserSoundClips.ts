import { Db, Collection } from "mongodb";
import Encoder from "./Encoder";
import Decoder from "./Decoder";
import Gets from "./Gets";
import Uploads from "./Uploads";
import Deletes from "./Deletes";
import { UserSoundClipsType } from "./typeConstant";

class UserSoundClips {
  private userSoundClipsCollection: Collection<UserSoundClipsType>;

  private encoder: Encoder;
  private decoder: Decoder;
  gets: Gets;
  uploads: Uploads;
  deletes: Deletes;

  constructor(private db: Db) {
    this.userSoundClipsCollection = this.db.collection("userSoundClips");

    this.encoder = new Encoder();
    this.decoder = new Decoder();
    this.gets = new Gets(this.userSoundClipsCollection, this.decoder);
    this.uploads = new Uploads(this.userSoundClipsCollection, this.encoder);
    this.deletes = new Deletes(this.userSoundClipsCollection);
  }
}

export default UserSoundClips;
