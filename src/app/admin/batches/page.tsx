"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Batch = {
  id: string;
  currentSemester: number;
  isActive: boolean;
  studentCount: number;
};

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    currentSemester: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/batches");
      if (res.ok) {
        setBatches(await res.json());
      }
    } catch (e) {
      console.error("Failed to load batches", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingBatchId ? `/api/admin/batches/${editingBatchId}` : "/api/admin/batches";
      const method = editingBatchId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${editingBatchId ? 'update' : 'create'} batch`);
      }

      await fetchBatches();
      setIsModalOpen(false);
      setEditingBatchId(null);
      setFormData({ id: "", currentSemester: 1, isActive: true });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatchId(batch.id);
    setFormData({
      id: batch.id, // we might not let them change ID, but keeping it for completeness
      currentSemester: batch.currentSemester,
      isActive: batch.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete the batch ${id}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/batches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      fetchBatches();
    } catch (e: any) {
      alert("Failed to delete batch: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Batch Management</h2>
          <p className="text-sm text-slate-500">Configure batches, sections, and map subjects to semesters.</p>
        </div>
        <button
          onClick={() => {
            setEditingBatchId(null);
            setFormData({ id: "", currentSemester: 1, isActive: true });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          Create Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
             <p className="text-slate-500">No batches created yet. Start by defining a new batch.</p>
          </div>
        ) : (
          batches.map((batch) => (
            <div key={batch.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-indigo-900">{batch.id}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${batch.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                    {batch.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 font-medium italic">Currently in Semester: {batch.currentSemester}</p>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex justify-between border-b border-slate-50 pb-1">
                    <span>Enrolled Students</span>
                    <span className="font-semibold text-slate-800">{batch.studentCount}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <Link 
                    href={`/admin/batches/${batch.id}`}
                    className="text-indigo-600 text-sm font-semibold hover:text-indigo-800"
                >
                    Assign Courses &rarr;
                </Link>
                <div className="flex gap-3">
                   <button onClick={() => handleEdit(batch)} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition">Edit</button>
                   <button onClick={() => handleDelete(batch.id)} className="text-rose-600 hover:text-rose-800 text-sm font-semibold transition">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingBatchId ? 'Edit Batch' : 'Define New Batch'}</h3>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Batch Identifier *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingBatchId}
                  placeholder="e.g., CYS-25"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white outline-none transition disabled:opacity-50"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-2">Use unique IDs representing the degree program and year.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Semester</label>
                <select
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white outline-none transition"
                  value={formData.currentSemester}
                  onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>Semester {n}</option>
                  ))}
                </select>
              </div>
              
              {editingBatchId && (
                <div className="flex items-center gap-3 mt-4">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActiveToggle" className="text-sm font-semibold text-slate-700">Active (Students can access courses)</label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  {editingBatchId ? 'Save Changes' : 'Register Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
