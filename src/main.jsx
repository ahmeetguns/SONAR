import { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import PasswordGate from "./PasswordGate.jsx";

function Root() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <PasswordGate onSuccess={() => setUnlocked(true)} />;
  return <App />;
}

createRoot(document.getElementById("root")).render(<Root />);
