import React, { useEffect, useRef, useState } from "react";

const SignalingLab = () => {
  const [status, setstatus] = useState("discoonected");
  const [genratedCode, setgenratedCode] = useState("");
  const [remoteCode, setremoteCode] = useState("");
  const [logs, setlogs] = useState<string[]>([]);

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

  //helper :  setup channel listers
  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannelRef.current = channel;

    channel.onopen = () => {
      addLog("Data channel is OPEN! we can chat.");
      setstatus("Connected (channel Open)");
    };

    channel.onmessage = (e) => {
      addLog(`Recived MEssage: ${e.data}`);
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
  const sendMessage = () => {
    if (dataChannelRef.current?.readyState === "open") {
      dataChannelRef.current.send("Hello form the other side!");
      addLog("sent: Hello!");
    } else {
      alert("channel not open");
    }
  };

  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700 max-w-2xl">
      <h2 className="text-xl font-bold mb-4 text-orange-400">
        Module 5: Signaling Lab
      </h2>
      <p className="mb-2 text-sm text-gray-300">
        Status: <span className="text-yellow-400 font-mono">{status}</span>
      </p>

      {/* Step 1: Generate Code */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded">
          <h3 className="font-bold text-gray-400 mb-2">
            1. Your Code (Copy this)
          </h3>
          <textarea
            readOnly
            value={genratedCode}
            className="w-full h-24 bg-black text-xs text-green-400 p-2 font-mono"
            placeholder="Waiting for you to create Offer/Answer..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={createOffer}
              className="px-3 py-1 bg-blue-600 text-xs rounded hover:bg-blue-700"
            >
              Create Offer (User A)
            </button>
            <button
              onClick={createAnswer}
              className="px-3 py-1 bg-purple-600 text-xs rounded hover:bg-purple-700"
            >
              Create Answer (User B)
            </button>
          </div>
        </div>

        {/* Step 2: Input Remote Code */}
        <div className="bg-gray-900 p-4 rounded">
          <h3 className="font-bold text-gray-400 mb-2">
            2. Friend's Code (Paste here)
          </h3>
          <textarea
            value={remoteCode}
            onChange={(e) => setremoteCode(e.target.value)}
            className="w-full h-24 bg-black text-xs text-blue-400 p-2 font-mono"
            placeholder="Paste the code from the other tab..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={addAnswer}
              className="px-3 py-1 bg-green-600 text-xs rounded hover:bg-green-700"
            >
              Accept Answer (User A)
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="mb-4">
        <button
          onClick={sendMessage}
          className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded font-bold"
        >
          Send "Hello" Message
        </button>
      </div>

      {/* Logs */}
      <div className="bg-black p-2 h-32 overflow-y-auto text-xs font-mono text-gray-500 rounded border border-gray-800">
        {logs.map((log, i) => (
          <div key={i}>{`> ${log}`}</div>
        ))}
      </div>
    </div>
  );
};

export default SignalingLab;
