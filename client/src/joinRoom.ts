import { Socket } from "socket.io-client";

const joinRoom = (
  socket: React.MutableRefObject<Socket>,
  roomNameRef: React.RefObject<HTMLInputElement>,
  usernameRef: React.RefObject<HTMLInputElement>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  setIsInRoom: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const previousRoomName = roomName.current;
  const previousUsername = username.current;

  if (roomNameRef.current) {
    roomName.current = roomNameRef.current?.value;
  }
  if (usernameRef.current) {
    username.current = usernameRef.current?.value;
  }
  if (roomName.current.trim() !== "" && username.current.trim() !== "") {
    // Leave previous room if there is one
    if (previousRoomName.trim() !== "" && previousUsername.trim() !== "") {
      socket.current.emit("leaveRoom", previousRoomName, previousUsername);
    }

    // Join new room
    socket.current.emit("joinRoom", roomName.current, username.current);
    setIsInRoom(true);
  }
};

export default joinRoom;
