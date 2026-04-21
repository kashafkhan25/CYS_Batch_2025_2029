"use client";
import Link from "next/link";

export default function AchievementsPage() {
  const badges = [
    { title: "Fast Learner", desc: "Completed 5 lessons in one day", icon: "⚡" },
    { title: "Top Scorer", desc: "Score 100% on a module quiz", icon: "🎯" },
    { title: "Perfect Attendance", desc: "100% presence in one month", icon: "⭐" },
    { title: "Project Lead", desc: "Submitted final project early", icon: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-12 lg:p-24">
       <Link href="/student" className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition mb-12 inline-block">&larr; Dashboard</Link>
       <header className="mb-20">
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-none">Your <br/><span className="text-indigo-600">Legacy.</span></h1>
            <p className="text-slate-400 font-bold text-xl">Track your academic milestones and badges.</p>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
           {badges.map((b, i) => (
               <div key={i} className="group bg-white p-12 rounded-[64px] border border-white shadow-2xl shadow-indigo-100/30 hover:shadow-indigo-200/50 transition-all duration-500 hover:-translate-y-3 flex flex-col items-center text-center">
                   <div className="w-24 h-24 rounded-[40px] bg-slate-50 flex items-center justify-center text-5xl mb-10 group-hover:rotate-12 transition-transform shadow-inner">
                        {b.icon}
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tighter">{b.title}</h3>
                   <p className="text-slate-400 font-medium text-sm leading-relaxed">{b.desc}</p>
                   <div className="mt-8 px-4 py-1 bg-indigo-50 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-100">UNLOCKED</div>
               </div>
           ))}
       </div>
    </div>
  );
}
