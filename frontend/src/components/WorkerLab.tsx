import React, { useEffect, useRef, useState } from "react";

const WorkerLab = () => {
  const [status, setstatus] = useState("Idle");
  const workerRef = useRef<Worker | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/test.worker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (e) => {
      const { status, processedData } = e.data;
      if (status === "DONE") {
        setstatus(
          `Recived back ${processedData.byteLength} bytes. worker is done.`,
        );
        console.log("[Main] Data recivied back:", processedData);
      }
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;

      console.log("End time:", endTime);
      console.log("Duration:", duration.toFixed(2), "ms");
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const runHeavyTask = () => {
    setstatus("Preparing 50MB payload...");

    const buffer = new ArrayBuffer(1024 * 1024 * 50);

    console.log("[Main] sending data to worker...");
    startTimeRef.current = performance.now();
    console.log("starttime:", startTimeRef.current);
    if (workerRef.current) {
      workerRef.current.postMessage(
        { id: 1, command: "PROCESS_CHUNK", data: buffer },
        [buffer],
      );
      setstatus("Data sent to worker ( memory transfered). waiting...");
    }

    if (buffer.byteLength === 0) {
      console.log(
        "[Main] SUCESS: Memory was transferred. Main thread no longer holds the data.",
      );
    }
  };
  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700 max-w-md">
      <h2 className="text-xl font-bold mb-4 text-purple-400">
        Module 3: Worker Lab
      </h2>
      <p className="mb-4 text-sm text-gray-300">
        Status: <span className="font-mono text-yellow-400">{status}</span>
      </p>
      <button
        onClick={runHeavyTask}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors"
      >
        Send 50MB to Worker
      </button>
    </div>
  );
};

export default WorkerLab;
