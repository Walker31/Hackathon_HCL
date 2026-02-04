import React, { useMemo, useState } from "react";
import SideItem from "../../Components/dashboard/SideItem";

export default function StudentDashboard() {
  const student = {
    name: "Alex",
    id: "48291",
    borrowedCount: 12,
    overdueCount: 2,
    totalFines: 14.5,
    goalRead: 12,
    goalTotal: 24,
  };

  const [activeNav, setActiveNav] = useState("Dashboard");
  const [search, setSearch] = useState("");

  const currentBorrows = useMemo(
    () => [
      {
        id: 1,
        title: "The Midnig...",
        author: "Matt Haig",
        tag: "Due in 3 days",
        tagTone: "info",
        actionLabel: "Renew Book",
        actionTone: "primary",
        coverColor: "from-amber-900 to-amber-950",
      },
      {
        id: 2,
        title: "Atomic Hab...",
        author: "James Clear",
        tag: "2 days Overdue",
        tagTone: "danger",
        actionLabel: "Pay Fine & Return",
        actionTone: "danger",
        coverColor: "from-emerald-100 to-emerald-200",
      },
      {
        id: 3,
        title: "Think Like ...",
        author: "Jay Shetty",
        tag: "Due in 12 days",
        tagTone: "info",
        actionLabel: "Renew Book",
        actionTone: "primary",
        coverColor: "from-slate-100 to-slate-200",
      },
    ],
    []
  );

  const announcements = useMemo(
    () => [
      {
        id: "a1",
        title: "Library Closure",
        desc: "The central library will be closed this Friday for maintenance.",
        icon: "📋",
        iconBg: "bg-amber-100",
      },
      {
        id: "a2",
        title: "New Arrivals",
        desc: "20+ new Sci-Fi novels have been added to the physical catalog.",
        icon: "💡",
        iconBg: "bg-blue-100",
      },
    ],
    []
  );

  const progressPct = Math.round((student.goalRead / student.goalTotal) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-6">
            <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
              <span className="text-sm font-bold" >L</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-4">NITT </p>
              <p className="text-xs text-slate-500 leading-4">Campus Library</p>
            </div>
          </div>

            <nav className="mt-6 grid gap-1">
              <SideItem label="Dashboard" active={activeNav} onClick={setActiveNav} icon="▦" />
              <SideItem label="Browse Catalog" active={activeNav} onClick={setActiveNav} icon="⌕" />
              <SideItem label="Borrowing History" active={activeNav} onClick={setActiveNav} icon="↺" />
              <SideItem label="My Wishlist" active={activeNav} onClick={setActiveNav} icon="♡" />
              <SideItem label="Fines & Payments" active={activeNav} onClick={setActiveNav} icon="💳" />
            </nav>

            <div className="mt-auto pt-8">
              <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-3">
                <div className="h-10 w-10 rounded-full bg-slate-300" />
                <div>
                  <p className="text-xs font-semibold">{student.name} Johnson</p>
                  <p className="text-[11px] text-slate-500">Student ID: {student.id}</p>
                </div>
              </div>

              <button className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                <span>⚙</span>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="text-slate-400">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search for books, authors, or ISBN..."
              />
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50">
              🔔
            </button>
          </div>

          {/* Welcome Banner */}
          <section className="mt-6 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-sm">
            <h1 className="text-3xl font-bold">Welcome back, {student.name}! 👋</h1>
            <p className="mt-2 max-w-xl text-sm text-white/90">
              You have <span className="font-semibold">3</span> books currently borrowed. Don&apos;t forget, <span className="font-semibold">&quot;The Psychology of Money&quot;</span> is due in <span className="font-semibold">3 days</span>.
            </p>
            <button className="mt-4 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:shadow-md active:scale-[0.98]">
              View Recommendations
            </button>
          </section>

          {/* Stats */}
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard title="Books Borrowed" value={student.borrowedCount} icon="📚" tone="blue" />
            <StatCard title="Overdue Books" value={student.overdueCount} icon="⏰" tone="red" />
            <StatCard
              title="Total Fines"
              value={`$${student.totalFines.toFixed(2)}`}
              icon="💳"
              tone="amber"
            />
          </section>

          {/* Current Borrows */}
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Current Borrows</h2>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {currentBorrows.map((b) => (
                <BorrowCard key={b.id} book={b} />
              ))}

              {/* Borrow another */}
              <div className="min-w-[200px] rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-2xl text-slate-400">
                  +
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">Borrow Another</p>
                <p className="mt-1 text-xs text-slate-500">Max 5 books at a time</p>
              </div>
            </div>
          </section>

          {/* Reading History */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Reading History</h2>
              <div className="flex gap-2">
                <Chip label="Last 30 Days" active />
                <Chip label="Last Year" />
              </div>
            </div>

            <div className="mt-4 h-32 rounded-xl bg-slate-50" />
          </section>
        </main>

        {/* Right panel */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-6 grid gap-4">
            {/* Yearly Goal */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold">Yearly Goal</h3>
              <p className="mt-4 text-3xl font-bold">
                {student.goalRead}/{student.goalTotal}
              </p>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Books read this year</span>
                <span className="font-bold text-blue-600">{progressPct}%</span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-600">
                You&apos;re on track! Read <span className="font-semibold">2 more</span> books this month to stay ahead of your goal.
              </p>
            </div>

            {/* Announcements */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Announcements</h3>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  View all
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {announcements.map((a) => (
                  <Announcement key={a.id} item={a} />
                ))}
              </div>
            </div>

            {/* Personalized Picks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold">Personalized Picks</h3>

              <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
                <p className="text-[10px] font-bold tracking-widest text-blue-300">
                  BASED ON HISTORY
                </p>
                <p className="mt-2 text-base font-bold">Dark Matter by Blake Crouch</p>

                <button className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:shadow-md active:scale-[0.98]">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ----------------- Components ----------------- */



function StatCard({ title, value, icon, tone = "blue" }) {
  const toneMap = {
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${toneMap[tone]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-0.5 text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BorrowCard({ book }) {
  const tagStyle =
    book.tagTone === "danger"
      ? "bg-red-50 text-red-700"
      : "bg-blue-50 text-blue-700";

  const actionStyle =
    book.actionTone === "danger"
      ? "border-red-200 text-red-700 hover:bg-red-50"
      : "border-blue-200 text-blue-700 hover:bg-blue-50";

  return (
    <div className="min-w-[200px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tagStyle}`}>
        {book.tag}
      </div>

      {/* Cover */}
      <div className={`mt-3 h-48 w-full rounded-xl bg-gradient-to-br ${book.coverColor} shadow-sm`} />

      <div className="mt-3">
        <p className="text-sm font-semibold">{book.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{book.author}</p>

        <button
          className={[
            "mt-3 w-full rounded-xl border bg-white px-4 py-2 text-xs font-semibold shadow-sm transition active:scale-[0.98]",
            actionStyle,
          ].join(" ")}
          onClick={() => alert(book.actionLabel)}
        >
          {book.actionLabel}
        </button>
      </div>
    </div>
  );
}

function Announcement({ item }) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-3">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.iconBg}`}>
        <span className="text-sm">{item.icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold">{item.title}</p>
        <p className="mt-1 text-[11px] leading-4 text-slate-600">{item.desc}</p>
      </div>
    </div>
  );
}

function Chip({ label, active }) {
  return (
    <button
      className={[
        "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      ].join(" ")}
    >
      {label}
    </button>
  );
}