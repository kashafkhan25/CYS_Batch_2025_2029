"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "STUDENT") {
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-indigo-50 animate-pulse">
        <Image src="/logo.png" alt="Logo" width={120} height={120} className="mb-6 rounded-full shadow-xl border-4 border-indigo-200" />
        <span className="font-black text-4xl text-indigo-400">BZU LMS</span>
      </div>
    );
  }

  if (session?.user?.role !== "STUDENT") return null;

  return <>{children}</>;
}
