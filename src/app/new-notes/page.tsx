import React, { useState } from "react";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma";
import NoteCard from "./compoents/NoteCard";
import NewNotesContainer from "./compoents/NewNotesContainer";

const NewLandingPage = async () => {
  const { userId } = auth();
  if (!userId) return new Error("User not found");

  const notes = await prisma.note.findMany({
    where: { userId },
  });

  return <NewNotesContainer notes={notes} />;
  //   return <div>1</div>;
};

export default NewLandingPage;
