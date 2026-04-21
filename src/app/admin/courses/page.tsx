"use client";

import { useState, useEffect } from "react";

type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  credits: number;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    credits: 3,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      if (res.ok) {
        setCourses(await res.json());
      }
    } catch (e) {
      console.error("Failed to load courses", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingCourseId ? `/api/admin/courses/${editingCourseId}` : "/api/admin/courses";
      const method = editingCourseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${editingCourseId ? 'update' : 'create'} course`);
      }

      await fetchCourses();
      setIsModalOpen(false);
      setEditingCourseId(null);
      setFormData({ code: "", title: "", description: "", credits: 3 });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description || "",
      credits: course.credits,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete ${code}?`)) return;
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      fetchCourses();
    } catch (e: any) {
      alert("Failed to delete course: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Course Catalog</h2>
          <p className="text-sm text-slate-500">Manage the global list of university courses offered by the department.</p>
        </div>
        <button
          onClick={() => {
            setEditingCourseId(null);
            setFormData({ code: "", title: "", description: "", credits: 3 });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          Add New Course
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              📚
            </div>
            <h3 className="text-lg font-bold text-slate-800">No courses defined</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">Build your department's curriculum by adding foundational and core courses to the catalog.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse cursor-default">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="px-6 py-4 font-semibold">Course Code</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Credits</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {course.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{course.title}</p>
                    {course.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{course.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{course.credits} CH</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(course)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-3">Edit</button>
                    <button onClick={() => handleDelete(course.id, course.code)} className="text-rose-600 hover:text-rose-900 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingCourseId ? 'Edit Course' : 'Define New Course'}</h3>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="CYS-101"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Credits *</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intro to Cybersecurity"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
