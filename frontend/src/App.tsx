import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import BinaryLab from "./components/BinaryLab";
import WorkerLab from "./components/WorkerLab";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-blue-500">Infinite Drop</h1>
      <p className="mt-2 text-gray-400">P2P File Transfer Architecture</p>

      {/* Module 2 Component */}
      {/* <BinaryLab /> */}
      <WorkerLab />
    </div>
  );
}

export default App;
