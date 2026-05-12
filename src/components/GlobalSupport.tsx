import { useState } from "react";
import { useLocation } from "react-router-dom";
import FloatingContactButton from "./FloatingContactButton";
import AISupportChat from "./AISupportChat";

export default function GlobalSupport() {
  const [aiOpen, setAiOpen] = useState(false);
  const { pathname } = useLocation();

  // Hide on admin routes
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {!aiOpen && <FloatingContactButton onOpenAI={() => setAiOpen(true)} />}
      <AISupportChat externalOpen={aiOpen} onExternalOpenChange={setAiOpen} />
    </>
  );
}
