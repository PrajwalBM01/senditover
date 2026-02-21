/// <reference lib="webworker" />

self.onmessage = (e: MessageEvent) => {
  console.log("e:", e);
  const { id, command, data } = e.data;
  console.log("id, command, data", id, command, data);
  if (command === "PROCESS_CHUNK") {
    console.log(`[Worker] Recived chunk of size: ${data.byteLength} bytes`);

    const view = new Uint8Array(data);
    for (let i = 0; i < view.length; i++) {
      view[i] = Math.floor(Math.random() * 255);
    }

    console.log("[Worker] Processing complete. Sending back.");

    self.postMessage({ id, status: "DONE", processedData: data }, [data]);
  }
};

