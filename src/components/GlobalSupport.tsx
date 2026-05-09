import { useState } from "react";
import { useLocation } from "react-router-dom";
import FloatingContactButton from "./FloatingContactButton";
import AISupportChat from "./AISupportChat";

export default function GlobalSupport() {
  const [aiOpen, setAiOpen] = useState(false);
  const { pathname } = useLocation();

  // Hide on admin and CMS routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/cms")) return null;

  return (
    <>
      <FloatingContactButton onOpenAI={() => setAiOpen(true)} />
      <AISupportChat externalOpen={aiOpen} onExternalOpenChange={setAiOpen} />
    </>
  );
}
