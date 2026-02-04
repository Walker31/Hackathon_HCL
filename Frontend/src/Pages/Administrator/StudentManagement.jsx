import React, { useMemo, useState, useEffect } from "react";
import AdminSidebar from "./components/sidebar";
import adminService from "../../services/adminService";
import borrowService from "../../services/borrowService";

export default function StudentsManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageSize = 10; // Match backend

  const [liveSummary, setLiveSummary] = useState(null);
  const [selectedBorrows, setSelectedBorrows] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setLiveSummary(data.summary);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
        // Allow page to render with default summary
      }
    };
    fetchSummary();
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Total Students",
        value: liveSummary?.total_students || "...",
        note: "Approved campus members",
        tone: "blue",
        icon: "👥",
      },
      {
        title: "Active Borrowers",
        value: liveSummary?.active_borrowers || "...",
        note: "Currently reading",
        tone: "purple",
        icon: "📚",
      },
      {
        title: "Outstanding Fines",
        value: `$${parseFloat(liveSummary?.total_fines || 0).toFixed(2)}`,
        note: "Across all members",
        tone: "red",
        icon: "⚠",
      },
      {
        title: "New Registrations",
        value: liveSummary?.pending_registrations || "...",
        note: "Pending approval",
        tone: "green",
        icon: "➕",
      },
    ],
    [liveSummary],
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await adminService.getStudentsWithDues({ page, search });
        setStudents(response.results || []);
        setTotalCount(response.count || 0);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        // Allow page to render without student data
        setStudents([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [page, search]);

  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  useEffect(() => {
    const fetchSelectedBorrows = async () => {
      if (selectedStudent) {
        try {
          setBorrowLoading(true);
          const data = await borrowService.getBorrowedBooks({ user_id: selectedStudent.user_id });
          setSelectedBorrows(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
          console.error("Failed to fetch student borrows:", err);
          // Allow page to render without borrow data
          setSelectedBorrows([]);
        } finally {
          setBorrowLoading(false);
        }
      }
    };
    fetchSelectedBorrows();
  }, [selectedStudent]);

  const quickBorrowed = selectedBorrows.map(b => ({
    title: b.book?.title || "Unknown",
    author: b.book?.author || "Unknown",
    badge: b.status === "overdue" ? "OVERDUE" : `DUE: ${new Date(b.due_date).toLocaleDateString()}`,
    badgeTone: b.status === "overdue" ? "danger" : "ok",
  })).slice(0, 3);

  const circulationHistory = selectedBorrows.filter(b => b.status === 'returned').map(b => ({
    title: b.book?.title || "Unknown",
    date: `Returned ${new Date(b.return_date).toLocaleDateString()}`
  })).slice(0, 3);

  const filtered = students; // Logic moved to useEffect

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = page;
  const paged = filtered;

  const onRegister = () => alert("Open Register Student modal/page");
  const onMessage = () => alert(`Message ${selectedStudent.name}`);
  const onCall = () => alert(`Call ${selectedStudent.name}`);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />
      <div className="ml-64">
        <div className="mx-auto flex flex-col gap-5 px-4 py-6">
          {/* Header row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              Student Management
            </h1>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-0 sm:w-[420px]">
                <span className="text-slate-400 flex-shrink-0">🔍</span>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search by name, ID, or dept..."
                />
              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95">
                ＋ Register Student
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Registered Students
                </h2>

                <div className="flex items-center gap-2">
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    ⚙
                  </button>
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    ⬇
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-xs font-semibold text-slate-500">
                    <tr className="border-b border-slate-200">
                      <th className="py-3 pr-4">STUDENT ID</th>
                      <th className="py-3 pr-4">NAME</th>
                      <th className="py-3 pr-4">DEPARTMENT</th>
                      <th className="py-3 pr-4">BORROWED BOOKS</th>
                      <th className="py-3 pr-4">TOTAL FINES</th>
                      <th className="py-3">STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paged.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={[
                          "cursor-pointer border-b border-slate-100 last:border-none hover:bg-slate-50",
                          selectedStudent?.id === s.id ? "bg-blue-50/60" : "",
                        ].join(" ")}
                      >
                         <td className="py-4 pr-4">
                           <div className="flex items-center gap-3">
                             <Avatar name={s.username} tone="slate" />
                             <span className="font-semibold">{s.username}</span>
                           </div>
                         </td>

                         <td className="py-4 pr-4 text-slate-600">{s.department}</td>

                         <td className="py-4 pr-4">
                           <div className="flex items-center gap-3">
                             <span className="font-semibold text-slate-800">
                               {s.borrowed_count || 0}
                             </span>
                           </div>
                         </td>

                         <td className="py-4 pr-4">
                           <span
                             className={[
                               "font-semibold",
                               parseFloat(s.total_fines) > 0 ? "text-red-600" : "text-slate-700",
                             ].join(" ")}
                           >
                             ${s.total_fines}
                           </span>
                         </td>

                        <td className="py-4">
                          <StatusPill status={s.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 pt-4">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(safePage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(safePage * pageSize, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {filtered.length}
                  </span>{" "}
                  entries
                </p>

                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </div>
            </section>

            {/* Right panel */}
            <aside className="w-full lg:w-80 lg:flex-shrink-0">
              <div className="grid gap-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">
                      STUDENT DETAILS
                    </p>
                    <button className="text-slate-400">✕</button>
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <Avatar
                      name={selectedStudent?.username || ""}
                      tone="blue"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {selectedStudent?.username}
                      </p>
                      <p className="text-xs text-slate-500">
                        Roll: {selectedStudent?.roll_number}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedStudent?.department}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500">
                        CURRENTLY BORROWED
                      </p>
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                        {selectedStudent?.borrowed_count || 0}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3">
                      {quickBorrowed.map((b, i) => (
                        <BorrowBadgeCard key={i} item={b} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500">
                        CIRCULATION HISTORY
                      </p>
                      <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">
                        VIEW ALL
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3">
                      {circulationHistory.map((h, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-emerald-600" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {h.title}
                            </p>
                            <p className="text-xs text-slate-500">{h.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function MetricCard({ title, value, note, tone, icon }) {
  const toneMap = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    red: "bg-red-50 border-red-100 text-red-700",
    green: "bg-emerald-50 border-emerald-100 text-emerald-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-xl font-semibold">{value}</p>
          <p
            className={[
              "mt-2 text-xs",
              tone === "red" ? "text-red-600" : "text-emerald-600",
            ].join(" ")}
          >
            {note}
          </p>
        </div>
        <div
          className={`grid h-10 w-10 place-items-center rounded-2xl border ${toneMap[tone]}`}
        >
          <span>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, tone = "slate" }) {
  const map = {
    slate: "from-slate-100 to-slate-300",
    amber: "from-amber-100 to-amber-300",
    rose: "from-rose-100 to-rose-300",
    emerald: "from-emerald-100 to-emerald-300",
    blue: "from-blue-100 to-blue-300",
    purple: "from-purple-100 to-purple-300",
    teal: "from-teal-100 to-teal-300",
  };
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${map[tone] || map.slate} text-xs font-bold text-slate-700`}
    >
      {initials}
    </div>
  );
}

function ToggleVisual({ on }) {
  return (
    <div
      className={[
        "relative inline-flex h-6 w-11 rounded-full border-2 transition-all duration-200",
        on ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-slate-200",
      ].join(" ")}
    >
      <div
        className={[
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          on ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </div>
  );
}

function StatusPill({ status }) {
  const map =
    status === "Active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${map}`}
    >
      {status}
    </span>
  );
}

function BorrowBadgeCard({ item }) {
  const badgeTone =
    item.badgeTone === "danger"
      ? "bg-red-100 text-red-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md">
      <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-sm">
        📘
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {item.title}
        </p>
        <p className="truncate text-xs text-slate-500">{item.author}</p>
        <p
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${badgeTone}`}
        >
          {item.badge}
        </p>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page buttons
    
    if (totalPages <= maxVisible) {
      // Show all pages if less than max
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Show first page
      pages.push(1);
      
      // Calculate middle range
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);
      
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-2xl border text-slate-600 shadow-sm transition",
          page === 1
            ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50"
            : "border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md active:scale-95",
        ].join(" ")}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pageNumbers.map((n, i) => (
        n === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-slate-400">…</span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={[
              "inline-flex h-9 w-9 items-center justify-center rounded-2xl border text-sm font-semibold shadow-sm transition",
              n === page
                ? "border-blue-500 bg-blue-600 text-white hover:bg-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md",
            ].join(" ")}
          >
            {n}
          </button>
        )
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-2xl border text-slate-600 shadow-sm transition",
          page === totalPages
            ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50"
            : "border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md active:scale-95",
        ].join(" ")}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
