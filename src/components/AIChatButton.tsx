import React, { useState } from "react";
import AIChatbot from "./AIChatbot";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";

interface AIChatButtonProps {
  icon?: boolean;
}

const AIChatButton = ({ icon }: AIChatButtonProps) => {
  const [chatBotOpen, setChatBotOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setChatBotOpen(!chatBotOpen)}
        variant={icon ? "ghost" : "default"}
      >
        <Bot
          size={icon ? 24 : 20}
          className={icon ? "" : "mr-2"}
          color={icon ? "gray" : "white"}
        />
        {icon ? "" : "AI Chatbot"}
      </Button>
      <AIChatbot open={chatBotOpen} onClose={() => setChatBotOpen(false)} />
    </>
  );
};

export default AIChatButton;
