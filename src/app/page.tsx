import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("./notes");

  return (
    <main className="flex flex-col items-center h-screen justify-center gap-5 ">
      <div className="flex items-center gap-4">
        <Image src={logo} width={100} height={100} alt="logo" />
        <span className="font-extrabold tracking-tight text-4xl lg:text-5xl">
          Vincent chatbot
        </span>
      </div>
      <p className="text-center max-w-prose">
        An intelligent note-taking with AI integration, built with Open,
        Pinecone, Next js , Shadcn, Clerk, and more.
      </p>
      <Button size="lg" asChild>
        <Link href="/notes">Open</Link>
      </Button>
    </main>
  );
}
