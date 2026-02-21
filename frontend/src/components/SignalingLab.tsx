import React, { useEffect, useRef, useState } from "react";

const SignalingLab = () => {
  const [status, setstatus] = useState("disconnected");
  const [genratedCode, setgenratedCode] = useState("");
  const [remoteCode, setremoteCode] = useState("");
  const [logs, setlogs] = useState<string[]>([]);
  const [msg, setmsg] = useState("");

  // webrtc object
  const peerRef = useRef<RTCPeerConnection | null>(null);
  // Data pipe
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const addLog = (msg: string) => setlogs((prev) => [...prev, msg]);

  useEffect(() => {
    // intialize peerConnection
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19320" }],
    });
    peerRef.current = peer;

    // Event listner : connnection state changes
    peer.onconnectionstatechange = () => {
      setstatus(peer.connectionState);
      addLog(`Connection state :${peer.connectionState}`);
    };

    //Event listner : ICE candidates (Networking)
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        //A new IP was found, in a server based we would send it immediatly
        //manual mode here
        console.log("new ICE Candidate:", e.candidate);
      } else {
        addLog("ICE Gathering complete. You can copy the code now.");
        if (peer.localDescription) {
          setgenratedCode(JSON.stringify(peer.localDescription));
        }
      }
    };

    //Event linstner: Reciving a Data Channel ( for the reciver )
    peer.ondatachannel = (e) => {
      addLog("Received a Data Channel from remote!");
      setupDataChannel(e.channel);
    };

    return () => peer.close();
  }, []);

  const logEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  //helper :  setup channel listers
  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannelRef.current = channel;

    channel.onopen = () => {
      addLog("Data channel is OPEN! we can chat.");
      setstatus("Connected (channel Open)");
    };

    channel.onmessage = (e) => {
      addLog(`Recived Message: ${e.data}`);
    };
  };

  //create offer
  const createOffer = async () => {
    addLog("creating offer...");
    const peer = peerRef.current!;

    const channel = peer.createDataChannel("Chat");
    setupDataChannel(channel);

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    addLog("Offer created. waiting for ICE candidates...");
  };

  //create answer
  const createAnswer = async () => {
    addLog("Creatig offer...");
    const peer = peerRef.current!;

    const offer = JSON.parse(remoteCode);
    await peer.setRemoteDescription(offer);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    addLog("Answer create. waiting for ICE Candidates...");
  };

  //add answer
  const addAnswer = async () => {
    addLog("Adding Remote answer...");
    const peer = peerRef.current!;
    const answer = JSON.parse(remoteCode);
    await peer.setRemoteDescription(answer);
  };

  //send a Message
  const sendMessage = (msg: string) => {
    if (dataChannelRef.current?.readyState === "open") {
      dataChannelRef.current.send(msg);
      addLog(`Sent Message:${msg}`);
    } else {
      alert("channel not open");
    }
  };

  return (
    <div className="mt-8 p-4 bg-neutral-900 rounded-2xl max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Signaling</h2>
      <p className="mb-2 text-sm text-gray-300">
        Status: <span className="text-green-700 font-mono">{status}</span>
      </p>

      {/* Step 1: Generate Code */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-neutral-950 p-4 rounded">
          <h3 className="font-bold text-gray-400 mb-2">1. Your Code</h3>
          <textarea
            readOnly
            value={genratedCode}
            className="w-full h-24 bg-black text-blue-600 text-xs p-2 font-mono"
            placeholder="Waiting for you to create Offer/Answer..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={createOffer}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-xs rounded cursor-pointer"
            >
              Create Offer (User A)
            </button>
            <button
              onClick={createAnswer}
              className="px-3 py-1  bg-blue-600 hover:bg-blue-700 text-xs rounded cursor-pointer"
            >
              Create Answer (User B)
            </button>
          </div>
        </div>

        {/* Step 2: Input Remote Code */}
        <div className="bg-neutral-950 p-4 rounded">
          <h3 className="font-bold text-gray-400 mb-2">2. Friend's Code</h3>
          <textarea
            value={remoteCode}
            onChange={(e) => setremoteCode(e.target.value)}
            className="w-full h-24 bg-black text-xs text-green-500 p-2 font-mono"
            placeholder="Paste the code from the other tab..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={addAnswer}
              className="px-3 py-1 bg-green-600 text-xs rounded hover:bg-green-700 cursor-pointer"
            >
              Accept Answer (User A)
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="mb-4 ">
        <textarea
          value={msg}
          onChange={(e) => {
            setmsg(e.target.value);
          }}
          className="border border-neutral-500 rounded w-full p-2"
        />
        <button
          onClick={() => {
            sendMessage(msg);
            setmsg("");
          }}
          className="w-full py-2 bg-neutral-300 text-black rounded font-bold cursor-pointer"
        >
          Send Message
        </button>
      </div>

      {/* Logs */}
      <div className="bg-black p-2 h-32 overflow-y-auto text-xs font-mono text-gray-500 rounded border border-gray-800">
        {logs.map((log, i) => (
          <div key={i}>{`> ${log}`}</div>
        ))}
        {/* This empty div acts as an anchor at the bottom */}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default SignalingLab;
