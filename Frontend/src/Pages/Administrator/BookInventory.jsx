import React, { useMemo, useState, useEffect } from "react";
import AdminSidebar from "./components/sidebar";
import AddNewBookModal from "../../modals/AddNewBookModal";
import booksService from "../../services/booksService";
import adminService from "../../services/adminService";

export default function AdminBookInventory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [editingBook, setEditingBook] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const pageSize = 10;

  // Transform API book data to match component expectations
  const transformBook = (book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    category: book.category,
    qty: book.available_copies || 0,
    status: (book.available_copies || 0) > 0 ? "Available" : "Checked Out",
    coverColor: book.thumbnail ? "bg-cover" : "bg-slate-300",
    thumbnail: book.thumbnail,
    rating: book.average_rating,
    pages: book.num_pages,
    year: book.published_year,
  });

  // Fetch books from API on component mount and when filters/page change
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          search: search.trim(),
          category: categoryFilter !== "All Categories" ? categoryFilter : undefined,
        };
        const response = await booksService.getAll(params);
        
        const results = response.results || [];
        const transformedBooks = results.map(transformBook);
        
        setBooks(transformedBooks);
        setTotalCount(response.count || 0);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch books:", err);
        // Don't show error, allow page to render without data
        setBooks([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, search, categoryFilter, refreshTrigger]);

  // Handle adding or updating a book
  const handleSubmitBook = async (bookData) => {
    try {
      if (bookData.id) {
        // Update existing book
        await booksService.update(bookData.id, bookData);
      } else {
        // Create new book
        await booksService.create(bookData);
        setPage(1); // Go to first page for new additions
      }
      setRefreshTrigger(p => p + 1);
      setIsModalOpen(false);
      setEditingBook(null);
    } catch (err) {
      console.error("Failed to save book:", err);
      alert("Failed to save the book. Please try again.");
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      return;
    }
    try {
      await booksService.delete(bookId);
      setRefreshTrigger(p => p + 1);
    } catch (err) {
      console.error("Failed to delete book:", err);
      alert("Failed to delete the book.");
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const categories = useMemo(() => {
    const cats = new Set(books.map(b => b.category));
    return ["All Categories", ...Array.from(cats).sort()];
  }, [books]);
  const statuses = ["All Status", "Available", "Checked Out"];

  // No local filtering needed anymore as we do it server-side
  const filtered = books;

  const totalPages = Math.max(1, Math.ceil(totalCount / 10)); // Backend page_size is 10
  const safePage = page;

  const paged = books;

  const [liveQuickStats, setLiveQuickStats] = useState([]);
  
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const dashData = await adminService.getDashboardStats();
        
        // Map dashboard stats to quick stats format
        const mapped = (dashData.stats || []).slice(0, 3).map(s => ({
          label: s.label,
          value: s.value.toLocaleString(),
          icon: s.icon,
          bg: s.bg.replace('bg-', 'bg-opacity-10 bg-'),
          text: s.bg.replace('bg-', 'text-'),
        }));
        setLiveQuickStats(mapped);
      } catch (err) {
        console.error("Failed to fetch quick stats:", err);
        // Allow page to render with default stats
      }
    };
    fetchQuickStats();
  }, []);

  const quickStats = liveQuickStats.length > 0 ? liveQuickStats : [
    { label: "Total Books", value: "...", icon: "📘", bg: "bg-blue-100", text: "text-blue-600" },
    { label: "Checked Out", value: "...", icon: "⏰", bg: "bg-amber-100", text: "text-amber-600" },
    { label: "Overdue Books", value: "...", icon: "⚠", bg: "bg-red-100", text: "text-red-600" },
  ];

  const [liveActivities, setLiveActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await adminService.getDashboardStats();
        // Map recent borrows to activity format
        const mapped = (data.recent_borrows || []).map(b => ({
          dot: b.status === 'borrowed' ? 'blue' : b.status === 'returned' ? 'green' : 'amber',
          text: `${b.status === 'borrowed' ? 'Borrowed' : 'Returned'}: ${b.title}`,
          sub: `${b.borrow} ${b.author ? `by ${b.author}` : ''}`
        }));
        setLiveActivities(mapped);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        // Allow page to render without activities
      }
    };
    fetchActivities();
  }, []);

  const activities = liveActivities.length > 0 ? liveActivities : [
    { dot: "blue", text: "Loading activities...", sub: "Please wait" },
  ];

  const onAddNewBook = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };
  const onUploadFiles = () => alert("Open Bulk Import flow");

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <AdminSidebar />
        <div className="ml-64 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-slate-500">Loading books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AddNewBookModal 
        open={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingBook(null);
        }}
        onSubmit={handleSubmitBook}
        onSave={handleSubmitBook}
        editingBook={editingBook}
      />
      <AdminSidebar />
      <div className="ml-64">
        {/* Main content area */}
        <div className="flex flex-1 gap-0">
          {/* Main */}
          <main className="flex-1 bg-slate-50 p-6">
            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            {/* Top search + add */}
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <span className="text-slate-400">🔍</span>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search Inventory (Title, Author, ISBN...)"
                />
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50">
                🔔
              </button>
              <button
                onClick={onAddNewBook}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <span>+</span>
                <span>Add New Book</span>
              </button>
            </div>

            {/* Main card */}
            <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              {/* Title + filters */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Book Inventory</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage and track all library resources in one place.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={categoryFilter}
                    onChange={(v) => {
                      setCategoryFilter(v);
                      setPage(1);
                    }}
                    options={categories}
                  />
                  <Select
                    value={statusFilter}
                    onChange={(v) => {
                      setStatusFilter(v);
                      setPage(1);
                    }}
                    options={statuses}
                  />
                  <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                    ☰
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs font-medium uppercase text-slate-500">
                    <tr>
                      <th className="pb-3 pr-4">Cover</th>
                      <th className="pb-3 pr-4">Book Details</th>
                      <th className="pb-3 pr-4">ISBN</th>
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3 pr-4 text-center">Qty</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-slate-100 last:border-none hover:bg-slate-50/50"
                      >
                        <td className="py-4 pr-4">
                          <img 
                            className="h-16 w-12 rounded shadow-sm" 
                            src={b.thumbnail || "https://via.placeholder.com/150x200?text=No+Cover"}
                            alt={b.title}
                          />
                        </td>

                        <td className="py-4 pr-4">
                          <p className="font-semibold">{b.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{b.author}</p>
                        </td>

                        <td className="py-4 pr-4 text-slate-600">{b.isbn}</td>

                        <td className="py-4 pr-4">
                          <CategoryTag label={b.category} />
                        </td>

                        <td className="py-4 pr-4 font-semibold text-center">{b.qty}</td>

                        <td className="py-4 text-center">
                          <StatusPill status={b.status} />
                        </td>

                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(b)}
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Book"
                            >
                              ✎
                            </button>
                            <button 
                              onClick={() => handleDeleteBook(b.id)}
                              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Book"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer + pagination */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Showing {(safePage - 1) * 10 + 1} to{" "}
                  {Math.min(safePage * 10, totalCount)} of {totalCount} entries
                </p>

                <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
              </div>
            </section>
          </main>

          {/* Right panel */}
          <aside className="hidden w-[320px] shrink-0 border-l border-slate-200 bg-white lg:block">
            <div className="sticky top-0 h-screen overflow-y-auto p-6">
              {/* Quick stats */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">Quick Stats</h3>
                  <button className="text-slate-400 hover:text-slate-600">⋯</button>
                </div>

                <div className="mt-4 grid gap-3">
                  {quickStats.map((s) => (
                    <QuickStatRow key={s.label} {...s} />
                  ))}
                </div>
              </div>

              {/* Recent activities */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">Recent Activities</h3>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    See all
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
                  {activities.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className={[
                          "mt-1 h-2 w-2 shrink-0 rounded-full",
                          a.dot === "blue"
                            ? "bg-blue-600"
                            : a.dot === "green"
                            ? "bg-emerald-600"
                            : "bg-amber-500",
                        ].join(" ")}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{a.text}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{a.sub}</p>
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
function Select({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium outline-none hover:bg-slate-50"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function BookCover({ color }) {
  return (
    <div className={`h-16 w-11 rounded-lg ${color} shadow-sm`} />
  );
}

function CategoryTag({ label }) {
  const styles = {
    FINANCE: "bg-blue-100 text-blue-700",
    FICTION: "bg-purple-100 text-purple-700",
    TECH: "bg-orange-100 text-orange-700",
    "SELF-HELP": "bg-sky-100 text-sky-700",
    HISTORY: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`inline-block rounded-md px-2 py-1 text-xs font-medium uppercase ${styles[label] || styles.HISTORY}`}>
      {label}
    </span>
  );
}

function StatusPill({ status }) {
  const isAvail = status === "Available";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        isAvail ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
      ].join(" ")}
    >
      <span className={`text-lg ${isAvail ? "text-emerald-600" : "text-red-600"}`}>●</span>
      {status === "Available" ? "Avail." : "Check Out"}
    </span>
  );
}

function QuickStatRow({ label, value, icon, bg, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${bg}`}>
        <span className={`text-xl ${text}`}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        disabled={page === 1}
      >
        ‹
      </button>

      {[1, 2, 3,4,5,6,].slice(0, Math.min(totalPages, 3)).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={[
            "grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold",
            n === page
              ? "bg-blue-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          ].join(" ")}
        >
          {n}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        disabled={page === totalPages}
      >
        ›
      </button>
    </div>
  );
}