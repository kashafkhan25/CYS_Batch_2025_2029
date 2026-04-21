"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ students: 0, teachers: 0, batches: 0, courses: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setActivity(data.recentActivity);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 tracking-tight animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white rounded-3xl p-10 shadow-2xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black mb-2 uppercase italic tracking-tighter">Command <span className="text-indigo-400">Center.</span></h1>
           <p className="text-slate-400 font-bold">Welcome back, {session?.user?.name || 'Administrator'}. System is nominal.</p>
        </div>
        <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Live Status:</span>
           <span className="ml-2 text-[10px] font-black uppercase text-emerald-400 animate-pulse">Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Enrollments" value={stats.students} icon="users" color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard title="Faculty" value={stats.teachers} icon="teacher" color="text-teal-600" bg="bg-teal-50" />
        <StatCard title="Batches" value={stats.batches} icon="batch" color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Curriculum" value={stats.courses} icon="book" color="text-rose-600" bg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50">
          <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">Real-Time Pulse</h2>
          <div className="space-y-6">
            {activity.map((item, idx) => (
               <ActivityItem 
                 key={idx}
                 action={item.action} 
                 desc={item.desc}
                 time={item.time} 
               />
            ))}
            {activity.length === 0 && <p className="text-slate-400 font-bold italic">No recent pulses detected.</p>}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50">
          <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">System Orbits</h2>
          <div className="grid grid-cols-2 gap-6">
            <QuickAction href="/admin/users" icon="👥" label="Identity" />
            <QuickAction href="/admin/assign-courses" icon="📚" label="Allocations" />
            <QuickAction href="/admin/reports" icon="📊" label="Audits" />
            <QuickAction href="/admin/settings" icon="⚙️" label="Config" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string, icon: string, label: string }) {
    return (
        <a href={href} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group flex flex-col items-center justify-center text-center">
          <span className="text-2xl mb-2 group-hover:scale-125 transition-transform">{icon}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">{label}</span>
        </a>
    );
}

function StatCard({ title, value, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
        <div className={`w-6 h-6 rounded-full opacity-50 ${color.replace('text-', 'bg-')}`} />
      </div>
    </div>
  );
}

function ActivityItem({ action, desc, time }: any) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-indigo-500 border-4 border-white shadow-sm z-10"></div>
        <div className="h-full w-0.5 bg-slate-200 mt-2"></div>
      </div>
      <div className="pb-4">
        <p className="text-sm text-slate-800">
          <span className="font-semibold">{action}</span> {desc}
        </p>
        <p className="text-xs text-slate-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
