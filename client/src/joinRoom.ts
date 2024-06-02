import { Socket } from "socket.io-client";

const joinRoom = (
  socket: React.MutableRefObject<Socket>,
  tableIdRef: React.RefObject<HTMLInputElement>,
  usernameRef: React.RefObject<HTMLInputElement>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  setIsInRoom: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const previousTableId = table_id.current;
  const previousUsername = username.current;

  if (tableIdRef.current) {
    table_id.current = tableIdRef.current?.value;
  }
  if (usernameRef.current) {
    username.current = usernameRef.current?.value;
  }
  if (table_id.current.trim() !== "" && username.current.trim() !== "") {
    // Leave previous room if there is one
    if (previousTableId.trim() !== "" && previousUsername.trim() !== "") {
      socket.current.emit("leaveRoom", previousTableId, previousUsername);
    }

    // Join new room
    socket.current.emit("joinRoom", table_id.current, username.current);
    setIsInRoom(true);
  }
};

export default joinRoom;
