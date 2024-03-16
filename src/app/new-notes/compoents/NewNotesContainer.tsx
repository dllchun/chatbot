"use client";
import React, { useState } from "react";
import { Note } from "@prisma/client";
import NoteCard from "./NoteCard";
import NewNoteContextProvider from "@/context/NewNoteContext";
import NoteContent from "./NoteContent";
import NewNoteList from "./NewNoteList";

interface NewNotesContainerProps {
  // passing an array of note object
  notes: Note[];
}

const NewNotesContainer = ({ notes }: NewNotesContainerProps) => {
  return (
    <NewNoteContextProvider notes={notes}>
      <main className="w-full ">
        <div className="flex">
          <NewNoteList notes={notes} />
          <NoteContent />
        </div>
      </main>
    </NewNoteContextProvider>
  );
};

export default NewNotesContainer;
