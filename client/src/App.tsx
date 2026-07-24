import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Host from "./pages/Host";
import Lobby from "./pages/Lobby";
import Removed from "./pages/Removed";
import SignIn from "./pages/SignIn";
import Discovery from "./pages/Discovery";
import MyQuizzes from "./pages/MyQuizzes";
import QuizBuilder from "./pages/QuizBuilder";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/lobby/:roomCode" element={<Lobby />} />
      <Route path="/removed" element={<Removed />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/host" element={<Host />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/my-quizzes" element={<MyQuizzes />} />
        <Route path="/quizzes/new" element={<QuizBuilder />} />
        <Route path="/quizzes/:quizId/edit" element={<QuizBuilder />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
