import React, { useEffect, useRef, useState } from "react";

const WebsocketsLab = () => {
  const [roomCode, setroomCode] = useState("");
  const [inviteCode, setinviteCode] = useState("");
  const [messages, setMessages] = useState<
    { senderId: string; text: string }[]
  >([]);
  const [clientId, setClientId] = useState("");
  // const [users, setusers] = useState(0);
  // const [userName, setuserName] = useState("");
  const WsRef = useRef<WebSocket | null>(null);
  const [connection, setconnection] = useState(false);
  const [error, seterror] = useState("");
  const [message, setmessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("connection established");
      WsRef.current = socket;
      // setusers((prev) => prev + 1);
      // setuserName(`User ${users + 1}`);
    };

    socket.onmessage = (data) => {
      const message = JSON.parse(data.data);
      handleMessage(message);
      console.log("Message received: ", data, typeof data);
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    const socket = WsRef.current;
    if (!socket || socket.readyState !== 1) return;

    if (!message.trim()) return;

    socket.send(
      JSON.stringify({
        type: "COMM",
        data: message,
      }),
    );

    setmessage("");
  };

  const createRoom = () => {
    const socket = WsRef.current!;

    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify({ type: "CREATE_ROOM" }));
    }
  };

  const handleMessage = (message: {
    type: string;
    data: string;
    senderId: string;
  }) => {
    console.log("message:", message);
    if (message.type === "ROOM_ID") {
      setroomCode(message.data);
      setconnection(true);
    }

    if (message.type === "ROOM_NOT_FOUND") {
      seterror(message.data);
    }

    if (message.type === "ROOM_JOINED") {
      setconnection(true);
      setroomCode(message.data);
    }

    if (message.type === "COMM") {
      setMessages((prev) => [
        ...prev,
        { senderId: message.senderId, text: message.data },
      ]);
    }

    if (message.type === "CLIENT_ID") {
      setClientId(message.data);
    }
  };

  const joinRoom = (inviteId: string) => {
    const socket = WsRef.current!;

    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify({ type: "JOIN_ROOM", data: inviteId }));
    }
  };

  if (!connection)
    return (
      <div className="max-w-lg w-full h-50 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold flex justify-center">Real time communication using websockets</h1>
        <div className="border border-neutral-800 p-4 rounded-xl flex flex-col gap-2 bg-neutral-800">
          <h1 className="font-semibold">Create a Room</h1>
          <button
            onClick={createRoom}
            className="bg-blue-500 py-1 rounded cursor-pointer"
          >
            Create
          </button>
        </div>
        <div className=" p-4 rounded-xl flex flex-col gap-4 bg-neutral-50">
          <h1 className="text-black font-semibold">
            Join a Room{" "}
            {error.length > 0 && (
              <p className="text-red-500 text-xs">{error}</p>
            )}
          </h1>
          <div className="flex  gap-2">
            <input
              type="text"
              className="border w-full p-1 rounded border-black text-black"
              value={inviteCode}
              onChange={(e) => setinviteCode(e.target.value)}
            />
            <button
              onClick={() => joinRoom(inviteCode)}
              className=" px-2 py-1 rounded bg-blue-500 cursor-pointer text-black"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="border max-w-md w-full h-auto flex flex-col gap-4 p-4 rounded-2xl bg-neutral-800 border-neutral-800">
      <div>
        <h1 className="text-2xl font-semibold text-green-600">Connected</h1>
        <p>Room ID: {roomCode}</p>
      </div>
      <div className="flex justify-center">
        <div className="border bg-white h-100 flex flex-col gap-2 max-w-md w-full justify-end p-2 rounded-2xl">
          <div className=" border-black h-full overflow-y-auto p-2 flex flex-col gap-2">
            {messages.map((msg, index) => {
              const isMe = msg.senderId === clientId;

              return (
                <div
                  key={index}
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                    isMe
                      ? "self-end bg-blue-500 text-white"
                      : "self-start bg-gray-300 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              );
            })}
          </div>
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setmessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="border w-full rounded-xl resize-none  border-black text-black p-1"
          />
        </div>
      </div>
    </div>
  );
};

export default WebsocketsLab;
