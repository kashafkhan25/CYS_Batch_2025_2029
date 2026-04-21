"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function TakeQuizPage({ params }: { params: Promise<{ id: string, quizId: string }> }) {
  const { id: offeringId, quizId } = use(params);
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // We'll need a GET quiz endpoint for students that hides the 'answer' field
    // or just fetch everything and handle it carefully.
    fetch(`/api/teacher/quizzes?courseOfferingId=${offeringId}`)
      .then(res => res.json())
      .then(data => {
          const q = data.find((item: any) => item.id === quizId);
          if (q) setQuiz(q);
      })
      .finally(() => setIsLoading(false));
  }, [quizId]);

  const handleSubmit = async () => {
    const res = await fetch("/api/student/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers })
    });
    if (res.ok) {
        const data = await res.json();
        setResult(data);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-3xl animate-pulse text-indigo-300">Preparing assessment...</div>;
  
  if (result) return (
      <div className="h-screen flex items-center justify-center bg-indigo-50 font-sans p-8">
          <div className="max-w-md w-full bg-white rounded-[48px] p-12 text-center shadow-2xl border border-white">
              <div className="text-8xl mb-8">🏆</div>
              <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter">Assessment Complete</h2>
              <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-xs">Final Result</p>
              
              <div className="text-7xl font-black text-indigo-600 mb-12 tracking-tighter">
                  {result.score} <span className="text-2xl text-slate-300 font-bold">/ {result.total}</span>
              </div>

              <div className="bg-indigo-50 p-6 rounded-3xl mb-12 border border-indigo-100">
                  <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
                      "Good job! Your results have been recorded and sent to your instructor for review."
                  </p>
              </div>

              <button 
                onClick={() => router.push(`/student/courses/${offeringId}`)}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition shadow-xl"
              >
                RETURN TO COURSE
              </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <header className="p-12 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-20">
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Active Questionary</p>
            <h1 className="text-4xl font-black tracking-tighter">{quiz?.title}</h1>
          </div>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-slate-100 rounded-2xl font-black text-xs hover:border-slate-300 transition"
          >
            QUIT
          </button>
      </header>

      <main className="max-w-3xl mx-auto p-12 py-24 space-y-24">
          {quiz?.questions.map((q: any, idx: number) => {
              const options = JSON.parse(q.options);
              return (
                  <section key={q.id} className="relative pl-20">
                      <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-500">
                          {idx + 1}
                      </div>

                      <h3 className="text-2xl font-black tracking-tight mb-8 leading-tight">{q.text}</h3>

                      <div className="grid grid-cols-1 gap-4">
                          {options.map((opt: string, oIdx: number) => (
                              <button
                                key={oIdx}
                                onClick={() => setAnswers({...answers, [q.id]: opt})}
                                className={`w-full text-left p-6 rounded-[28px] border-2 transition-all duration-300 font-bold group ${
                                    answers[q.id] === opt 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200' 
                                    : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'
                                }`}
                              >
                                  <div className="flex items-center gap-4">
                                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs border ${
                                          answers[q.id] === opt ? 'bg-indigo-500 border-indigo-400' : 'bg-white border-slate-100 text-slate-300'
                                      }`}>
                                          {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      {opt}
                                  </div>
                              </button>
                          ))}
                      </div>
                  </section>
              );
          })}

          <div className="pt-24 border-t border-slate-100 flex justify-center">
              <button 
                onClick={handleSubmit}
                className="px-20 py-6 bg-indigo-600 text-white font-black rounded-full hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-200 uppercase tracking-widest text-sm"
              >
                  Submit Assessment
              </button>
          </div>
      </main>
    </div>
  );
}
