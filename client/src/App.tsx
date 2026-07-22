import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Host from "./pages/Host";
import Lobby from "./pages/Lobby";
import SignIn from "./pages/SignIn";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/lobby/:roomCode" element={<Lobby />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/host" element={<Host />} />
      </Route>
    </Routes>
  );
}

export default App;
