"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  rollNumber?: string;
  batch?: { name: string };
  createdAt: string;
};

type RegistrationRequest = {
  id: string;
  name: string;
  email: string;
  role: string;
  rollNumber?: string;
  batchId?: string;
  createdAt: string;
};

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "STUDENT", batchId: "", rollNumber: "" });

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/admin/batches");
      if (res.ok) setBatches(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      if (res.ok) setRequests(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleProcessRequest = async (requestId: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        fetchRequests();
        fetchUsers();
      }
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsUploading(true);
    setResults(null);

    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      if (!target?.result) return;
      
      Papa.parse(target.result as string, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const response = await fetch("/api/admin/users/import", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ users: results.data }),
            });
            
            const data = await response.json();
            setResults({
              success: data.successCount || 0,
              failed: data.errors?.length || 0
            });
            fetchUsers();
          } catch (error) {
            console.error("Error uploading users:", error);
            alert("Failed to process the CSV upload.");
          } finally {
            setIsUploading(false);
          }
        }
      });
    };
    reader.readAsText(csvFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
    const method = editingUser ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role: "STUDENT", batchId: "", rollNumber: "" });
        fetchUsers();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8 tracking-tight">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Identity Management</h1>
          <p className="text-slate-500 font-bold mt-2">Oversee faculty, student enrollment, and access requests.</p>
        </div>
        <button 
          onClick={() => { 
            setEditingUser(null); 
            setFormData({ name: "", email: "", password: "", role: "STUDENT", batchId: "", rollNumber: "" });
            setShowAddModal(true); 
          }}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition"
        >
          + Provision User
        </button>
      </header>

      <div className="flex bg-slate-100 p-1.5 rounded-[28px] max-w-md">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-[22px] transition ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Active Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-[22px] transition ${activeTab === 'requests' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Pending Review ({requests.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
           <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                {activeTab === 'users' ? 'Registered Brains' : 'Access Petitions'}
              </h2>
           </div>
           <div className="overflow-x-auto">
              {activeTab === 'users' ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-8 py-6">Identity</th>
                      <th className="px-8 py-6">Role / ID</th>
                      <th className="px-8 py-6">Affiliation</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map(user => (
                      <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-800 tracking-tight">{user.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' : user.role === 'TEACHER' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                              {user.role}
                            </span>
                            {user.rollNumber && <span className="text-[10px] font-black text-slate-400">{user.rollNumber}</span>}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-slate-500">{user.batch?.name || '---'}</span>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button onClick={() => { 
                            setEditingUser(user); 
                            setFormData({ ...formData, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber || "", batchId: (user as any).batchId || "" }); 
                            setShowAddModal(true); 
                          }} className="p-2 text-slate-300 hover:text-indigo-600 transition">✏️</button>
                          <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-300 hover:text-rose-600 transition">🗑️</button>
                        </td>
                      </tr>
                    ))}
                    {isLoading && <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-bold italic animate-pulse">Synchronizing records...</td></tr>}
                    {!isLoading && users.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-bold italic">Clear horizon. No users found.</td></tr>}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-8 py-6">Applicant</th>
                      <th className="px-8 py-6">Proposed Role</th>
                      <th className="px-8 py-6">Details</th>
                      <th className="px-8 py-6 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requests.map(req => (
                      <tr key={req.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-800 tracking-tight">{req.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{req.email}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.role === 'TEACHER' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                            {req.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-xs font-bold text-slate-500">
                            {req.rollNumber && <p>Roll: {req.rollNumber}</p>}
                            {req.batchId && <p>Batch: {batches.find(b => b.id === req.batchId)?.name || '---'}</p>}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button onClick={() => handleProcessRequest(req.id, "APPROVE")} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition">Approve</button>
                          <button onClick={() => handleProcessRequest(req.id, "REJECT")} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition">Reject</button>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-300 font-bold italic">Inbox is empty. No pending petitions.</td></tr>}
                  </tbody>
                </table>
              )}
           </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-100/50">
            <h2 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Bulk Provision (CSV)</h2>
            <p className="text-xs text-slate-400 font-bold leading-relaxed mb-8">Format: name, email, role, batch, section, rollNumber</p>
            
            <form onSubmit={handleFileUpload} className="space-y-6">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="block w-full text-[10px] font-black uppercase text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-900 file:text-white hover:file:bg-indigo-600 transition-colors cursor-pointer"
              />
              <button
                type="submit"
                disabled={!csvFile || isUploading}
                className="w-full py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-50 transition-all"
              >
                {isUploading ? "Syncing..." : "Process Manifest"}
              </button>
            </form>

            {results && (
              <div className={`mt-8 p-6 rounded-[28px] ${results.failed > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 font-black">Sync Result</p>
                <p className="text-xs font-bold leading-relaxed">Accepted: {results.success} / Denied: {results.failed}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[56px] w-full max-w-xl p-12 shadow-4xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition text-2xl">×</button>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-10">{editingUser ? 'Synthesize Identity' : 'Forge New Presence'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Identity</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-[24px] px-8 py-5 font-bold focus:ring-2 ring-indigo-500 transition" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Digital Mail</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-[24px] px-8 py-5 font-bold focus:ring-2 ring-indigo-500 transition" />
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Access Key</label>
                  <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border-none rounded-[24px] px-8 py-5 font-bold focus:ring-2 ring-indigo-500 transition" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Class Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border-none rounded-[24px] px-8 py-5 font-black uppercase text-[10px] tracking-widest focus:ring-2 ring-indigo-500 transition">
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                {formData.role === "STUDENT" && (
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Batch Link</label>
                    <select value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})} className="w-full bg-slate-50 border-none rounded-[24px] px-8 py-5 font-black uppercase text-[10px] tracking-widest focus:ring-2 ring-indigo-500 transition">
                      <option value="">-- Batch --</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {formData.role === "STUDENT" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Academic Roll Number</label>
                  <input placeholder="e.g., CYS-24-001" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} className="w-full bg-slate-50 border-none rounded-[24px] px-8 py-5 font-bold focus:ring-2 ring-indigo-500 transition" />
                </div>
              )}
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all mt-6">
                {editingUser ? 'Save System Changes' : 'Finalize Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
