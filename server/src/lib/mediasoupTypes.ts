import { Socket } from "socket.io";

export interface MediasoupSocket extends Socket {
  table_id?: string;
  username?: string;
  instance?: string;
}
