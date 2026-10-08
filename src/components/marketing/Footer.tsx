import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[15px] font-semibold text-slate-900">InboxShelf</p>
          <p className="mt-1 text-[13px] text-slate-500">
            Every customer chat and order on one shelf.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-slate-600">
          <a href="#features" className="hover:text-slate-900">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-slate-900">
            How It Works
          </a>
          <a href="#pricing" className="hover:text-slate-900">
            Pricing
          </a>
          <Link href="/login" className="hover:text-slate-900">
            Log In
          </Link>
          <Link href="/signup" className="hover:text-slate-900">
            Sign Up
          </Link>
        </nav>
      </div>
      <div className="border-t border-slate-200/80">
        <p className="mx-auto max-w-6xl px-6 py-5 text-[12px] text-slate-500">
          © 2026 InboxShelf. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
