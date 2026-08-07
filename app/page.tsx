import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <header className="absolute top-0 right-0 flex items-center justify-end p-4">
        <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">medibilldo</span>
      </header>
      <div className="flex h-screen flex-col items-center justify-center gap-5 px-5 text-center">
        <div className="size-16 flex items-center justify-center rounded-2xl bg-black text-white font-extrabold text-2xl tracking-tighter shadow-sm mb-2">
          mb
        </div>

        <h1 className="font-bold text-4xl tracking-tight">medibilldo</h1>

        <p className="text-lg text-muted-foreground max-w-md">
          A secure role-based billing management platform built for modern practices.
        </p>

        <div className="flex gap-3 mt-2">
          <Link href="/login">
            <Button variant="outline" className="px-6 border-black hover:bg-black hover:text-white transition-colors duration-200">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="px-6 bg-black text-white hover:bg-zinc-800 transition-colors duration-200">Signup</Button>
          </Link>
        </div>
      </div>
    </>
  );
}

