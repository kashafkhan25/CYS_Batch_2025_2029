"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

type Course = { id: string; code: string; title: string };
type Teacher = { id: string; name: string; email: string };
type Offering = {
  id: string;
  course: { id: string; code: string; title: string };
  teacher: { id: string; name: string; email: string };
  semesterNum: number;
  section: string;
};

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: batchId } = use(params);
  
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfferingId, setEditingOfferingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    courseId: "",
    teacherId: "",
    semesterNum: 1,
    section: "A",
  });

  useEffect(() => {
    Promise.all([
      fetchOfferings(),
      fetchCatalog(),
      fetchTeachers()
    ]).finally(() => setIsLoading(false));
  }, [batchId]);

  const fetchOfferings = async () => {
    const res = await fetch(`/api/admin/offerings?batchId=${batchId}`);
    if (res.ok) setOfferings(await res.json());
  };

  const fetchCatalog = async () => {
    const res = await fetch("/api/admin/courses");
    if (res.ok) setCatalog(await res.json());
  };

  const fetchTeachers = async () => {
    const res = await fetch("/api/admin/teachers");
    if (res.ok) setTeachers(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingOfferingId) {
        const res = await fetch("/api/admin/offerings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: editingOfferingId }),
        });
        if (!res.ok) throw new Error("Failed to update course allocation");
      } else {
        const res = await fetch("/api/admin/offerings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, batchId }),
        });
        if (!res.ok) throw new Error("Failed to allocate course");
      }
      
      await fetchOfferings();
      setIsModalOpen(false);
      setEditingOfferingId(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEdit = (offering: Offering) => {
    setEditingOfferingId(offering.id);
    setFormData({
      courseId: offering.course.id || "", // wait, course currently only returns code and title in GET. We need the ID!
      teacherId: offering.teacher?.id || "",
      semesterNum: offering.semesterNum,
      section: offering.section,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this course allocation?")) return;
    await fetch("/api/admin/offerings", {
        method: "DELETE",
        body: JSON.stringify({ id })
    });
    fetchOfferings();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
        <Link href="/admin/batches" className="hover:text-indigo-600">Batches</Link>
        <span>/</span>
        <span className="text-slate-900">{batchId}</span>
      </div>

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{batchId} Overview</h2>
          <p className="text-slate-500 mt-1">Manage course offerings and faculty assignments for this batch.</p>
        </div>
        <button
          onClick={() => {
            setEditingOfferingId(null);
            setFormData({ courseId: "", teacherId: "", semesterNum: 1, section: "A" });
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          Assign New Course
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
           <h3 className="font-bold text-slate-700">Allocated Courses</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-medium">Loading allocations...</div>
        ) : offerings.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <p className="text-4xl mb-4">📓</p>
            <p className="font-medium">No courses have been assigned to this batch yet.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Instructor</th>
                <th className="px-6 py-4">Section</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {offerings.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition group">
                  <td className="px-6 py-4 text-slate-600">Sem {o.semesterNum}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900">{o.course.title}</p>
                    <p className="text-xs text-indigo-600">{o.course.code}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-800">{o.teacher?.name || 'TBD'}</p>
                    <p className="text-xs text-slate-400">{o.teacher?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">{o.section}</span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3 items-center">
                    <button 
                        onClick={() => handleEdit(o)}
                        className="text-indigo-500 opacity-0 group-hover:opacity-100 hover:text-indigo-700 transition font-bold text-sm"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => handleDelete(o.id)}
                        className="text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-700 transition font-bold text-sm"
                    >
                        Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-slate-100">
            <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">{editingOfferingId ? 'Edit Assignment' : 'Assign Course'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Semester</label>
                    <select
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 font-medium focus:bg-white"
                        value={formData.semesterNum}
                        onChange={(e) => setFormData({...formData, semesterNum: parseInt(e.target.value)})}
                    >
                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section</label>
                    <select
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 font-medium focus:bg-white"
                        value={formData.section}
                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                    >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Course From Catalog</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 font-medium focus:bg-white"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                >
                  <option value="">-- Choose a Course --</option>
                  {catalog.map(c => (
                    <option key={c.id} value={c.id}>[{c.code}] {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assign Instructor (Faculty)</label>
                <select
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 font-medium focus:bg-white"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">-- Choose a Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 uppercase tracking-widest text-xs"
                >
                  {editingOfferingId ? 'Save Changes' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
