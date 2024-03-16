import React from "react";
import NewNoteNavbar from "./compoents/NewNoteNavbar";

const NewNotesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-full overflow-y-hidden ">
      <div className="flex ">
        <NewNoteNavbar />
        {children}
      </div>
    </div>
  );
};

export default NewNotesLayout;
