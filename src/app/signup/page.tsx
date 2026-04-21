"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    batchId: "",
  });

  useEffect(() => {
    fetch("/api/admin/batches")
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setSuccess(true);
      setTimeout(() => router.push("/login"), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl text-center">
          <div className="text-6xl mb-8">🎉</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Request Received</h2>
          <p className="text-slate-500 font-bold leading-relaxed mb-8">
            Your registration request has been submitted to the administration. Please wait for approval.
            You will be redirected to the login page shortly.
          </p>
          <Link href="/login" className="text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline">
            Go to Login Now &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <Link href="/" className="mb-12 flex items-center gap-3 group">
        <Image src="/logo.png" alt="BZU Logo" width={48} height={48} className="rounded-full shadow-lg group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-black text-slate-900 tracking-tighter italic">BZU<span className="text-indigo-600 font-black">LMS</span></span>
      </Link>

      <div className="max-w-xl w-full bg-white rounded-[56px] p-12 lg:p-16 shadow-2xl shadow-slate-200 border border-white">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 text-center">Join the <span className="text-indigo-600">Portal.</span></h1>
        <p className="text-slate-400 font-bold text-center mb-12 uppercase text-[10px] tracking-[0.3em]">Department of Communication & Cyber Security</p>

        {error && (
          <div className="mb-8 p-6 bg-rose-50 text-rose-700 text-sm rounded-3xl border border-rose-100 font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-slate-100 p-1.5 rounded-[28px] mb-8">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-[22px] transition ${role === 'STUDENT' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("TEACHER")}
              className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-[22px] transition ${role === 'TEACHER' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Teacher
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Full Identity Name</label>
            <input
              required
              placeholder="e.g., MUHAMMAD"
              className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 font-bold focus:ring-2 ring-indigo-500 transition text-slate-900 placeholder:text-slate-400"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Official Email Address</label>
            <input
              required
              type="email"
              placeholder="name@bzu.edu.pk"
              className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 font-bold focus:ring-2 ring-indigo-500 transition text-slate-900 placeholder:text-slate-400"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Secret Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 font-bold focus:ring-2 ring-indigo-500 transition pr-16 text-slate-900 placeholder:text-slate-400"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {role === "STUDENT" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Roll Number</label>
                <input
                  required
                  placeholder="CYS-24-001"
                  className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 font-bold focus:ring-2 ring-indigo-500 transition text-slate-900 placeholder:text-slate-400"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Assigned Batch</label>
                <select
                  required
                  className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 font-bold focus:ring-2 ring-indigo-500 transition text-slate-900"
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                >
                  <option value="">-- Batch --</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all mt-6 disabled:opacity-50"
          >
            {isLoading ? "Syncing..." : "Submit Registration Request"}
          </button>

          <p className="text-center text-sm font-bold text-slate-400 pt-6">
            Already have an account? <Link href="/login" className="text-indigo-600 hover:underline">Log in &rarr;</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
