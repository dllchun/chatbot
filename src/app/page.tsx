import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("./new-notes");

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5 ">
      <div className="flex items-center gap-4">
        {/* <Image src={logo} width={100} height={100} alt="logo" /> */}
        <span className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Quick Note AI | Vincent Cheung
        </span>
      </div>
      <p className="max-w-prose text-center">
        An intelligent note-taking with AI integration, built with Open,
        Pinecone, Next js , Shadcn, Clerk, and more.
      </p>
      <Button size="lg" asChild>
        <Link href="/new-notes">Open</Link>
      </Button>
    </main>
  );
}
