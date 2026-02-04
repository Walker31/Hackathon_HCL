import { useMemo, useState, useEffect } from "react";
import AdminSidebar from "./components/sidebar";
import adminService from "../../services/adminService";

export default function AdminDashboard() {
  const [range, setRange] = useState("Weekly");

  const [stats, setStats] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data.stats || []);
        setOverdueLoans(data.overdue_loans || []);
        setRecentBorrows(data.recent_borrows || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set default empty values to allow page to render
        setStats([]);
        setOverdueLoans([]);
        setRecentBorrows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const borrowedBooks = recentBorrows;
  const circulationHistory = useMemo(() => [], []); 

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />
      <div className="ml-64">
        {/* Main content area with padding */}
        <div className="flex flex-1 gap-0">
          {/* Main */}
          <main className="flex-1 bg-slate-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none"
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((s, idx) => (
                <MiniStat key={idx} {...s} />
              ))}
            </div>
            {/* Overdue loans table */}
            <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Overdue book loans</h2>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  See all
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs font-medium text-slate-500">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">ID</th>
                      <th className="pb-3 pr-4 font-medium">Member</th>
                      <th className="pb-3 pr-4 font-medium">Title</th>
                      <th className="pb-3 pr-4 font-medium">Author</th>
                      <th className="pb-3 pr-4 font-medium">Overdue</th>
                      <th className="pb-3 font-medium">Return date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueLoans.map((r, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 last:border-none"
                      >
                        <td className="py-4 pr-4 text-slate-600">{r.id}</td>
                        <td className="py-4 pr-4 font-medium">{r.member}</td>
                        <td className="py-4 pr-4 text-slate-700">{r.title}</td>
                        <td className="py-4 pr-4 text-slate-600">{r.author}</td>
                        <td className="py-4 pr-4">
                          <span className="inline-block rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                            {r.overdue}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600">{r.returnDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          {/* Right panel */}
          <aside className="hidden w-[340px] shrink-0 border-l border-slate-200 bg-white lg:block">
            <div className="sticky top-0 h-screen overflow-y-auto p-6">
              {/* Quick reviews */}
              <div className="rounded-xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">Quick reviews</h3>
                  <button className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-lg bg-white p-3">
                  <div className="h-10 w-10 rounded-full bg-slate-300" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Eleanor Amantis</p>
                    <p className="text-xs text-slate-500">Member since 2020</p>
                  </div>
                  <span className="text-slate-300">›</span>
                </div>

                <div className="mt-3 grid gap-2">
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <span>💬</span>
                    <span>Send a Message</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <span>📞</span>
                    <span>Call Eleanor</span>
                  </button>
                </div>
              </div>

              {/* Borrowed book */}
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">Recent Borrows</h3>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                    {borrowedBooks.length}
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {borrowedBooks.map((b, i) => (
                    <BorrowedBookRow key={i} item={b} />
                  ))}
                </div>
              </div>

              {/* Circulation history */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">Book circulation history</h3>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    See all
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {circulationHistory.map((c, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-none">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{c.title}</p>
                        <p className="text-xs text-slate-500">{c.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{c.date}</p>
                        <p className="mt-0.5 text-xs font-medium text-emerald-600">{c.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */



function MiniStat({ label, value, icon, bg }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${bg} text-white`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function LegendDot({ label, colorClass }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${colorClass} ${colorClass === 'bg-white' ? 'border border-slate-300' : ''}`} />
      <span className="text-slate-600">{label}</span>
    </div>
  );
}



function BorrowedBookRow({ item }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className={`h-20 w-14 shrink-0 rounded-lg bg-gradient-to-br ${item.cover}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-snug">{item.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{item.author}</p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">{item.code}</p>

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
            {item.status}
          </span>
        </div>
        
        <div className="mt-2 text-[11px] text-slate-500">
          <div className="flex justify-between">
            <span><span className="font-medium text-slate-700">Borrowed</span> {item.borrow}</span>
            <span><span className="font-medium text-slate-700">Return</span> {item.returnBy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
