import { Note } from "@prisma/client";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

interface NewNoteContextState {
  notes: Note[];
  currentNote: Note | null;
  setCurrentNote: Dispatch<SetStateAction<Note | null>>;
  setNotes: Dispatch<SetStateAction<Note[]>>;
}

const NewNoteContext = createContext<NewNoteContextState | null>(null);

const NewNoteContextProvider = ({
  notes,
  children,
}: {
  notes: Note[];
  children: React.ReactNode;
}) => {
  const [notesState, setNotes] = useState<Note[]>(notes);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  return (
    <NewNoteContext.Provider
      value={{
        notes: notesState,
        currentNote,
        setCurrentNote,
        setNotes,
      }}
    >
      {children}
    </NewNoteContext.Provider>
  );
};

export default NewNoteContextProvider;

export const useNewNoteContext = () => {
  const context = useContext(NewNoteContext);
  if (!context) throw new Error("missing context");
  return context;
};
