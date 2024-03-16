import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNewNoteContext } from "@/context/NewNoteContext";
import { useUser } from "@clerk/nextjs";
import { Clock, Tag, Trash, User } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import LoadingButton from "@/components/ui/loading-button";

const NoteContent = () => {
  const { user } = useUser();
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const { currentNote, setCurrentNote } = useNewNoteContext();
  const updateTime = currentNote?.updatedAt.toDateString();
  const noteId = currentNote?.id.slice(-4);
  const router = useRouter();

  async function deleteNote() {
    setDeleteInProgress(true);
    try {
      const response = await fetch("/api/notes", {
        method: "DELETE",
        body: JSON.stringify({
          id: currentNote?.id,
        }),
      });
      if (!response.ok) throw new Error("Status code: " + response.status);
      setDeleteInProgress(false);
      router.refresh();
      setCurrentNote(null);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="w-full">
      {currentNote ? (
        <div className="flex flex-col">
          <div className="border border-gray-200">
            <div className="w-full px-10 py-5">
              <div className="flex space-x-3">
                <span className="text-lg text-muted-foreground">#</span>
                <div className="flex flex-1 flex-col space-y-2">
                  <div className="flex space-x-3">
                    <h2 className="text-lg font-semibold">
                      {currentNote.title}
                    </h2>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-end space-x-2">
                      <div className="flex items-center space-x-1">
                        <User size={16} />
                        <span className="text-sm">{user?.fullName}</span>
                      </div>

                      <Separator orientation="vertical" />
                      <div className="flex items-center space-x-1">
                        <Tag size={16} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {noteId}
                        </span>
                      </div>

                      <Separator orientation="vertical" />
                      <div className="flex items-center space-x-1">
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {updateTime}
                        </span>
                      </div>
                    </div>
                    {/* DELETE NOTE BUTTON */}
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button variant={"destructive"} size="cust">
                          <Trash size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>

                          <LoadingButton
                            loading={deleteInProgress}
                            type="button"
                            variant="destructive"
                            onClick={deleteNote}
                          >
                            Delete Note
                          </LoadingButton>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-10">{currentNote.content}</div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          Create or select your note
        </div>
      )}
    </div>
  );
};

export default NoteContent;
