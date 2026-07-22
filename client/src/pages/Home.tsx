import axios from "axios";
import { useState } from "react";

function Home() {
  const [message, setMessage] = useState("Loading...");

  axios
    .get("/api/data")
    .then((response) => {
      setMessage(response.data.message);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      setMessage("Error fetching data");
    });

  return <div>{message}</div>;
}

export default Home;
