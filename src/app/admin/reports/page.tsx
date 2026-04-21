"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports/teachers")
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <Link href="/admin" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 inline-block hover:underline">&larr; Back to Overview</Link>
           <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">System <br/><span className="text-indigo-600">Reports.</span></h1>
           <p className="text-slate-400 font-bold text-lg mt-4 italic">Auditing teacher performance and course velocity.</p>
        </div>
        <div className="flex gap-4">
            <button className="px-6 py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-xl">Export PDF</button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(n => <div key={n} className="h-80 bg-slate-100 rounded-[40px] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {reports.map((report) => (
            <div key={report.id} className="group bg-white p-10 rounded-[56px] border border-slate-100 shadow-3xl shadow-slate-200/50 hover:shadow-indigo-200/30 transition-all duration-500 hover:-translate-y-2">
               <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">👨‍🏫</div>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${report.activeStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                    {report.activeStatus}
                  </span>
               </div>
               
               <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1 uppercase truncate">{report.name}</h3>
               <p className="text-slate-400 font-bold text-xs mb-8 truncate">{report.email}</p>

               <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grading Efficiency</p>
                    <p className={`text-lg font-black ${report.gradingRate > 80 ? 'text-emerald-500' : report.gradingRate > 50 ? 'text-amber-500' : 'text-rose-500'}`}>{report.gradingRate}%</p>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div className={`h-full rounded-full transition-all duration-1000 ${report.gradingRate > 80 ? 'bg-emerald-500' : report.gradingRate > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${report.gradingRate}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                     <div className="p-4 bg-slate-50 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Courses</p>
                        <p className="text-xl font-black text-slate-800">{report.coursesCount}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resources</p>
                        <p className="text-xl font-black text-slate-800">{report.resourceCount}</p>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
