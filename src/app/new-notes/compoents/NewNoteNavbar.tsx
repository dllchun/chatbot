"use client";

import AIChatButton from "@/components/AIChatButton";
import AddEditNoteDialog from "@/components/AddEditNoteDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { Bot, Home, Pen, SquarePen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const NewNoteNavbar = () => {
  const [showAddEditNoteDialog, setshowAddEditNoteDialog] = useState(false);
  const path = usePathname();
  console.log(path);
  return (
    <>
      <nav className="w-1/10  h-screen overflow-auto px-4 py-5 shadow ">
        <div className="flex flex-col items-center justify-center space-y-10">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  scale: "1.3",
                },
              },
            }}
          />
          <div className="flex flex-col items-center justify-center space-y-5">
            <Link
              href="/new-note"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                path === "/new-notes" ? "bg-blue-100" : "",
                "flex items-center justify-center",
              )}
            >
              <Home
                color={path === "/new-notes" ? "#1f6ba1" : "gray"}
                size="20"
              />
            </Link>

            <Button
              variant="ghost"
              onClick={() => setshowAddEditNoteDialog(true)}
            >
              <SquarePen size={20} color="gray" />
            </Button>
            <AIChatButton icon={true} />
          </div>
        </div>
      </nav>
      <AddEditNoteDialog
        open={showAddEditNoteDialog}
        setOpen={setshowAddEditNoteDialog}
      />
    </>
  );
};

export default NewNoteNavbar;
