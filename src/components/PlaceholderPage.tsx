"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function PlaceholderPage({ title }: { title: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // More robust: determine back link based on current path prefix
  const backLink = pathname?.startsWith("/teacher") ? "/teacher" : "/student";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-12 text-center">
      <div className="text-9xl mb-8">🚧</div>
      <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 capitalize">{title}</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-12 font-medium">
        This feature is currently under high-intensity development and will be available in the next release.
      </p>
      <Link href={backLink} className="px-12 py-4 bg-indigo-600 text-white font-black rounded-[32px] shadow-2xl shadow-indigo-100/50 hover:-translate-y-1 transition duration-300">
        Back to Dashboard
      </Link>
    </div>
  );
}
