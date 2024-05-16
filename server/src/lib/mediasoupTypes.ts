import { Socket } from "socket.io";

export interface MediasoupSocket extends Socket {
  roomName?: string;
  username?: string;
}
