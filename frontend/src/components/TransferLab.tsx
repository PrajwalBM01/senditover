import React, { useEffect, useRef, useState } from "react";

const CHUNK_SIZE = 16 * 1024; //16KB
const BUFFER_THRESHHOLD = 1024 * 1024; //1MB

const TransferLab = () => {
  const [connectionStatus, setconnectionStatus] = useState("Disconnected");
  const [transferStatus, settransferStatus] = useState("Idle");
  const [recivedByte, setrecivedByte] = useState(0);
  const [localOffer, setlocalOffer] = useState("");
  const [remoteAnswer, setremoteAnswer] = useState("");

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = peer;

    peer.onconnectionstatechange = () =>
      setconnectionStatus(peer.connectionState);

    peer.onicecandidate = (e) => {
      if (!e.candidate && peer.localDescription) {
        setlocalOffer(JSON.stringify(peer.localDescription));
      }
    };

    peer.ondatachannel = (e) => {
      const channel = e.channel;
      setupChannel(channel);
    };

    return () => {
      peer.close();
    };
  }, []);

  const setupChannel = (channel: RTCDataChannel) => {
    dataChannelRef.current = channel;
    channel.onopen = () => setconnectionStatus("Connected");

    channel.onmessage = (e) => {
      const size = e.data.byteLength;
      setrecivedByte((prev) => prev + size);
    };
  };

  const creatOffer = async () => {
    const peer = peerRef.current!;

    const channel = peer.createDataChannel("transfer", {
      ordered: false,
      maxRetransmits: 0, //if a packet is lost ignore it for testing
    });

    setupChannel(channel);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
  };

  const createAnswer = async () => {
    const peer = peerRef.current!;
    const offer = JSON.parse(remoteAnswer);
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
  };

  const acceptAnswer = async () => {
    const peer = peerRef.current!;
    const answer = JSON.parse(remoteAnswer);
    await peer.setRemoteDescription(answer);
  };

  //backpresureloop
  const startSendingData = async () => {
    if (
      !dataChannelRef.current ||
      dataChannelRef.current.readyState !== "open"
    ) {
      alert("connection not created yet!.");
      return;
    }

    const channel = dataChannelRef.current;

    const TOTAL_SIZE = 100 * 1024 * 1024;

    let byteSent = 0;

    const chunk = new Uint8Array(CHUNK_SIZE);

    settransferStatus("Sending...");

    while (byteSent < TOTAL_SIZE) {
      if (channel.bufferedAmount > BUFFER_THRESHHOLD) {
        //YES: Wait for the buffer to drain
        //"onbufferedamountlow" fires when it drops below the threshold

        await new Promise<void>((resolve) => {
          channel.onbufferedamountlow = () => {
            channel.onbufferedamountlow = null;
            resolve();
          };
        });
      }

      //NO : send data
      try {
        channel.send(chunk);
        byteSent += CHUNK_SIZE;

        //update UI every 1 MB
        if (byteSent % (1024 * 1024) === 0) {
          settransferStatus(`Sent ${(byteSent / 1024 / 1024).toFixed(0)} MB`);
          await new Promise((r) => setTimeout(r, 0));
        }
      } catch (error) {
        console.log(error);
        break;
      }
    }

    setremoteAnswer("DOne! 100MB sent.");
  };

  return (
    <div className="mt-8 p-4 bg-neutral-900 rounded max-w-2xl">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">
        Flow Control
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-2 rounded">
          <p className="text-gray-400 text-xs">Connection</p>
          <p className="font-bold text-white">{connectionStatus}</p>
        </div>
        <div className="p-2 rounded">
          <p className="text-gray-400 text-xs">Status</p>
          <p className="font-bold ">{transferStatus}</p>
          {recivedByte > 0 && (
            <p className="text-green-400">
              Recv: {(recivedByte / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>

      {/* Connection Area */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={creatOffer}
          className="bg-blue-600 px-3 py-1 rounded text-sm cursor-pointer"
        >
          1. Create Offer (A)
        </button>
        <button
          onClick={createAnswer}
          className="bg-purple-600 px-3 py-1 rounded text-sm cursor-pointer"
        >
          2. Create Answer (B)
        </button>
        <button
          onClick={acceptAnswer}
          className="bg-green-600 px-3 py-1 rounded text-sm cursor-pointer"
        >
          3. Accept Answer (A)
        </button>
      </div>

      <textarea
        value={localOffer}
        readOnly
        className="w-full bg-black text-xs h-16 mb-2 text-gray-400 p-1 rounded"
        placeholder="Your Local Code (Copy this)"
      />
      <textarea
        value={remoteAnswer}
        onChange={(e) => setremoteAnswer(e.target.value)}
        className="w-full bg-black text-xs h-16 mb-4 text-blue-400 p-1 rounded"
        placeholder="Remote Code (Paste here)"
      />

      <button
        onClick={startSendingData}
        className="w-full py-3 font-bold rounded shadow-lg bg-neutral-200 text-black cursor-pointer"
      >
        🚀 Test Speed (Send 100MB Junk)
      </button>
    </div>
  );
};

export default TransferLab;
