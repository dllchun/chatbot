"use client";

import React, { useContext, useEffect, useState } from "react";
import { Note } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNewNoteContext } from "@/context/NewNoteContext";

interface NoteCardProps {
  note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
  const createdTime = note.createdAt.toDateString();
  const { currentNote, setCurrentNote } = useNewNoteContext();
  const [isNoteClicked, setIsNoteClicked] = useState(false);

  useEffect(() => {
    if (isNoteClicked) {
      console.log(currentNote?.title);
      setIsNoteClicked(false);
    }
  }, [currentNote, isNoteClicked]);

  const handleNoteClick = () => {
    setCurrentNote(note);
    setIsNoteClicked(true);
  };

  return (
    <Card
      className="cursor-pointer hover:text-muted-foreground"
      onClick={handleNoteClick}
    >
      <CardHeader>
        <CardTitle className="mb-2">{note.title}</CardTitle>
        <Separator />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3 ">
          <p className="line-clamp-3 text-sm ">{note.content}</p>
          <span className="text-sm text-muted-foreground ">{createdTime}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;
