"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import logo from "@/assets/logo.png";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddEditNoteDialog from "@/components/AddEditNoteDialog";

const NavBar = () => {
  const [showAddEditNoteDialog, setshowAddEditNoteDialog] = useState(false);

  return (
    <>
      <div className="p-4 shadow ">
        <div className="max-w-7xl m-auto flex flex-wrap gap-3 items-center justify-between ">
          <Link href="/notes" className="flex items-center gap-1">
            <Image src={logo} alt="Vincent Logo" width={40} height={40} />
            <span className="font-bold">Vincent</span>
          </Link>

          <div className="flex items-center gap-3">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
              }}
            />
            <Button onClick={() => setshowAddEditNoteDialog(true)}>
              <Plus size={20} className="mr-2" />
              Add Note
            </Button>
          </div>
        </div>
      </div>
      <AddEditNoteDialog
        open={showAddEditNoteDialog}
        setOpen={setshowAddEditNoteDialog}
      />
    </>
  );
};

export default NavBar;
