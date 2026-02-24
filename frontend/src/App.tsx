import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import BinaryLab from "./components/BinaryLab";
import WorkerLab from "./components/WorkerLab";
import FIleSystemLab from "./components/FIleSystemLab";
import SignalingLab from "./components/SignalingLab";
import TransferLab from "./components/TransferLab";
import WebsocketsLab from "./components/WebsocketsLab";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
      {/* <BinaryLab /> */}
      {/* <WorkerLab /> */}
      {/* <FIleSystemLab /> */}
      {/* <SignalingLab /> */}
      {/* <TransferLab /> */}
      <WebsocketsLab/>
    </div>
  );
}

export default App;
