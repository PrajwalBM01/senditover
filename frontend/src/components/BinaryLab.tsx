import React, { useState } from "react";

const BinaryLab = () => {
  const [status, setstatus] = useState("Idel");

  const createAndDownload = () => {
    const buffer = new ArrayBuffer(5);

    const view = new Uint8Array(buffer);

    view[0] = 72;
    view[1] = 101;
    view[2] = 108;
    view[3] = 108;
    view[4] = 111;

    console.log("memory Contents:", view);

    const blob = new Blob([buffer], { type: "text/plain" });
    setstatus(`Created Blob: ${blob.size} bytes`);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hello-vite.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="border border-gray-500 flex flex-col justify-center items-center p-10 rounded">
      <h2 className="font-bold text-2xl">Binary</h2>
      <p className="mb-4 text-sm text-gray-300">
        Status: <span className="font-mono text-yellow-400">{status}</span>
      </p>
      <button
        onClick={createAndDownload}
        className=" bg-white px-4 py-2 text-black rounded font-medium transition-colors"
      >
        Generate Binary File
      </button>
    </div>
    // <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700 max-w-md">
    //   <h2 className="text-xl font-bold mb-4 text-green-400">
    //     Binary
    //   </h2>
    //   <p className="mb-4 text-sm text-gray-300">
    //     Status: <span className="font-mono text-yellow-400">{status}</span>
    //   </p>
    //   <button
    //     onClick={createAndDownload}
    //     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
    //   >
    //     Generate Binary File
    //   </button>
    // </div>
  );
};

export default BinaryLab;
