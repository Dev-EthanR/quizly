import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Host from "./pages/Host";
import Lobby from "./pages/Lobby";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/host" element={<Host />} />
      <Route path="/lobby/:roomCode" element={<Lobby />} />
    </Routes>
  );
}

export default App;
