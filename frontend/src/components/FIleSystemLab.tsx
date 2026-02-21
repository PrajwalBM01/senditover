import React, { useState } from "react";

const FIleSystemLab = () => {
  const [status, setstatus] = useState("Idle");
  const [progress, setprogress] = useState(0);

  const startStreamWrite = async () => {
    try {
      setstatus("Waiting for user to pick a location...");
      //request access to save file, this opens the native OS "save as" dailog
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: "stream-test.txt",
        types: [
          {
            description: "Text Files",
            accept: { "text/plain": [".txt"] },
          },
        ],
      });

      setstatus("File created. opening stream...");

      //create the writable stream, a pipeline
      const writeable = await fileHandle.createWritable();

      const totalChunks = 100;

      for (let i = 0; i < totalChunks; i++) {
        const text = `Line ${i}: this data is streaming directly to disk.\n`;
        await writeable.write(text);

        setprogress(Math.round(((i + 1) / totalChunks) * 100));
        setstatus(`Writing chunk ${i + 1}/${totalChunks}...`);

        await new Promise((r) => setTimeout(r, 10));
      }

      await writeable.close();

      setstatus("Success! File written directly to disk");
      setprogress(100);
    } catch (err: any) {
      console.log(err);
      setstatus(`Error: ${err.message}`);
    }
  };
  return (
    <div className="mt-8 p-6 bg-neutral-900 rounded-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4 ">File System</h2>

      <p className="mb-2 text-sm text-gray-300">
        Status: <span className="font-mono text-yellow-400">{status}</span>
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <div
          className="bg-red-600 h-2.5 rounded-full transition-all duration-75"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <button
        onClick={startStreamWrite}
        className="px-4 py-2 bg-white text-black rounded font-medium transition-colors"
      >
        Start Stream Write
      </button>
    </div>
  );
};

export default FIleSystemLab;
