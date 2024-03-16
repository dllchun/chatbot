import React from "react";
import NoteCard from "./NoteCard";
import { Note } from "@prisma/client";

const NewNoteList = ({ notes }: { notes: Note[] }) => {
  return (
    <div className="hidden h-screen w-1/2 max-w-[450px] overflow-y-auto bg-gray-50 p-6 sm:block">
      <div className="flex flex-col space-y-4">
        {notes.map((note) => {
          return <NoteCard note={note} key={note.id} />;
        })}
      </div>
    </div>
  );
};

export default NewNoteList;
