"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type BatchSummary = {
  id: string;
  studentCount: number;
  offeringCount: number;
};

export default function AssignCoursesPage() {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBatchSummaries();
  }, []);

  const fetchBatchSummaries = async () => {
    try {
      const res = await fetch("/api/admin/batches");
      if (res.ok) {
        const batchData = await res.json();
        // For each batch, fetch its offering count
        const summaries = await Promise.all(batchData.map(async (b: any) => {
           const offRes = await fetch(`/api/admin/offerings?batchId=${b.id}`);
           const offerings = offRes.ok ? await offRes.json() : [];
           return {
             id: b.id,
             studentCount: b.studentCount,
             offeringCount: offerings.length
           };
        }));
        setBatches(summaries);
      }
    } catch (e) {
      console.error("Failed to load batch summaries", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Course Assignment Center</h2>
        <p className="text-slate-500 mt-1">Select a batch to manage its course offerings and instructor allocations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading batches and assignments...</div>
        ) : batches.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
             <p className="text-slate-500 font-medium">No active batches found. Create a batch first.</p>
             <Link href="/admin/batches" className="text-indigo-600 hover:underline mt-2 inline-block">Go to Batch Management &rarr;</Link>
          </div>
        ) : (
          batches.map((batch) => (
            <div key={batch.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-indigo-900 group-hover:text-indigo-600 transition">{batch.id}</h3>
                  <p className="text-sm font-medium text-slate-400">Batch Identifier</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
                  📚
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Allocated Courses</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">{batch.offeringCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Total Students</span>
                  <span className="text-slate-800 font-bold">{batch.studentCount}</span>
                </div>
              </div>

              <Link 
                href={`/admin/batches/${batch.id}`}
                className="block w-full py-3 bg-slate-900 text-white text-center rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg shadow-slate-100"
              >
                Manage Assignments
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
