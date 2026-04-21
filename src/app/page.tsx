import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="px-6 mx-auto w-full max-w-7xl h-16 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="BZU Logo"
            width={36}
            height={36}
            className="rounded-full object-contain shadow-sm border border-slate-200"
          />
          <span className="font-semibold text-slate-900">BZU LMS</span>
        </div>
        <nav>
          <Link
            href="/login"
            className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Welcome to <span className="text-indigo-600">BZU LMS</span>
          </h1>
          <p className="max-w-xl mx-auto text-xl text-slate-600">
            Empowering the next generation of Cyber Security experts at Bahauddin Zakariya University.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 md:text-lg transition shadow-sm"
            >
              Access Portal
            </Link>
          </div>
        </div>

        <div className="mt-20 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Course Catalog</h3>
            <p className="mt-2 text-slate-600 text-sm">Access structured modules for networking, ethical hacking, and programming.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Secure Access</h3>
            <p className="mt-2 text-slate-600 text-sm">Role-based access control ensuring data privacy for students and faculty.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">AI Assistant</h3>
            <p className="mt-2 text-slate-600 text-sm">Get immediate answers and guidance from the integrated department AI chatbot.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center border-t border-slate-200 mt-auto">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Bahauddin Zakariya University - Department of Communication & Cyber Security. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
