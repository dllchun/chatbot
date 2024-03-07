import React, { useState } from "react";
import AIChatbot from "./AIChatbot";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";

const AIChatButton = () => {
  const [chatBotOpen, setChatBotOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setChatBotOpen(true)}>
        <Bot size={20} className="mr-2" />
        AI Chatbot
      </Button>
      <AIChatbot open={chatBotOpen} onClose={() => setChatBotOpen(false)} />
    </>
  );
};

export default AIChatButton;
