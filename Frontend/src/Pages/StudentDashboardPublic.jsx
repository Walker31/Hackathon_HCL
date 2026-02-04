import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SideItem from "../Components/dashboard/SideItem";
import booksService from "../services/booksService";
import borrowService from "../services/borrowService";

export default function StudentDashboardPublic() {
  // No auth required - standalone component
  const username = "Guest User";
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [borrowSuccess, setBorrowSuccess] = useState("");
  const [liveStats, setLiveStats] = useState({
    borrowedCount: 0,
    overdueCount: 0,
    totalFines: 0,
    activities: []
  });

  // Load books and borrowed books on mount
  useEffect(() => {
    loadData();
  }, [activeNav]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeNav === "Dashboard" || activeNav === "Browse Catalog") {
        try {
          const booksList = await booksService.getAll();
          setBooks(booksList || []);
        } catch (err) {
          console.error("Failed to load books:", err);
          setBooks([]);
        }
      }
      if (activeNav === "Dashboard" || activeNav === "Borrowing History") {
        try {
          const borrowed = await borrowService.getBorrowedBooks();
          setBorrowedBooks(Array.isArray(borrowed) ? borrowed : borrowed?.results || []);
        } catch (err) {
          console.error("Failed to load borrowed books:", err);
          setBorrowedBooks([]);
        }
      }
      if (activeNav === "Dashboard") {
        try {
          const s = await borrowService.getStudentStats();
          setLiveStats(s);
        } catch (err) {
          console.error("Failed to load stats:", err);
          setLiveStats({
            borrowedCount: 0,
            overdueCount: 0,
            totalFines: 0,
            activities: []
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      setBorrowSuccess("");
      setError("");
      await borrowService.borrowBook(bookId);
      setBorrowSuccess("Book borrowed successfully!");
      setTimeout(() => setBorrowSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError("Failed to borrow book: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReturnBook = async (borrowId) => {
    if (window.confirm("Are you sure you want to return this book?")) {
      try {
        setError("");
        await borrowService.returnBook(borrowId);
        setBorrowSuccess("Book returned successfully!");
        setTimeout(() => setBorrowSuccess(""), 3000);
        loadData();
      } catch (err) {
        setError("Failed to return book: " + err.message);
      }
    }
  };

  const handleRenewBook = async (borrowId) => {
    try {
      setError("");
      await borrowService.renewBook(borrowId);
      setBorrowSuccess("Book renewed successfully!");
      setTimeout(() => setBorrowSuccess(""), 3000);
      loadData();
    } catch (err) {
      setError("Failed to renew book: " + err.message);
    }
  };

  const filteredBooks = books.filter((book) => {
    const q = search.toLowerCase();
    return (
      book.title?.toLowerCase().includes(q) ||
      book.author?.toLowerCase().includes(q) ||
      book.isbn?.includes(q)
    );
  });

  const stats = liveStats;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-6">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
                <span className="text-sm font-bold">L</span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-4">NITT </p>
                <p className="text-xs text-slate-500 leading-4">Campus Library</p>
              </div>
            </div>

            <nav className="mt-6 grid gap-1">
              <SideItem 
                label="Dashboard" 
                active={activeNav} 
                onClick={setActiveNav} 
                icon="▦" 
              />
              <SideItem 
                label="Browse Catalog" 
                active={activeNav} 
                onClick={setActiveNav} 
                icon="⌕" 
              />
              <SideItem 
                label="Borrowing History" 
                active={activeNav} 
                onClick={setActiveNav} 
                icon="↺" 
              />
            </nav>

            <div className="mt-auto pt-8">
              <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-3">
                <div className="h-10 w-10 rounded-full bg-slate-300" />
                <div>
                  <p className="text-xs font-semibold">{username}</p>
                  <p className="text-[11px] text-slate-500">Student</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <main className="flex-1 min-w-0">
          {/* Status Banner */}
          <div className="mb-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-100 text-blue-600">
                <span className="text-xl">ℹ️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900">Demo Mode</h3>
                <p className="mt-1 text-sm text-blue-700 font-medium">
                  You are viewing the Student Dashboard in public demo mode. Log in to access your personal account.
                </p>
              </div>
            </div>
          </div>

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
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          {borrowSuccess && (
            <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
              {borrowSuccess}
            </div>
          )}

          {activeNav === "Dashboard" && (
            <>
              {/* Welcome Banner */}
              <section className="mt-6 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white shadow-sm">
                <h1 className="text-3xl font-bold">Welcome! 👋</h1>
                <p className="mt-2 max-w-xl text-sm text-white/90">
                  Browse our library catalog and manage your book borrowing.
                </p>
              </section>

              {/* Stats */}
              <section className="mt-6 grid gap-4 sm:grid-cols-3">
                <StatCard 
                  title="Books Borrowed" 
                  value={stats.borrowedCount} 
                  icon="📚" 
                  tone="blue" 
                />
                <StatCard 
                  title="Overdue Books" 
                  value={stats.overdueCount} 
                  icon="⏰" 
                  tone={stats.overdueCount > 0 ? "red" : "blue"}
                />
                <StatCard
                  title="Total Fines"
                  value={`$${stats.totalFines.toFixed(2)}`}
                  icon="💳"
                  tone={stats.totalFines > 0 ? "amber" : "blue"}
                />
              </section>

              {/* Current Borrows */}
              <section className="mt-8">
                <h2 className="text-lg font-bold">Currently Borrowed</h2>
                {loading ? (
                  <p className="mt-4 text-slate-500">Loading...</p>
                ) : borrowedBooks.length > 0 ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {borrowedBooks.map((book) => (
                      <BorrowedBookCard 
                        key={book.id} 
                        book={book}
                        onReturn={() => handleReturnBook(book.id)}
                        onRenew={() => handleRenewBook(book.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">No books borrowed yet</p>
                  </div>
                )}
              </section>

              {/* Available Books */}
              <section className="mt-8">
                <h2 className="text-lg font-bold">Browse Available Books</h2>
                {loading ? (
                  <p className="mt-4 text-slate-500">Loading...</p>
                ) : filteredBooks.length > 0 ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredBooks.slice(0, 8).map((book) => (
                      <BookCard 
                        key={book.id} 
                        book={book}
                        onBorrow={() => handleBorrowBook(book.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-600">No books available</p>
                  </div>
                )}
              </section>
            </>
          )}

          {activeNav === "Browse Catalog" && (
            <section className="mt-6">
              <h2 className="text-lg font-bold mb-4">Book Catalog</h2>
              {loading ? (
                <p className="text-slate-500">Loading...</p>
              ) : filteredBooks.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBooks.map((book) => (
                    <BookCard 
                      key={book.id} 
                      book={book}
                      onBorrow={() => handleBorrowBook(book.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <p className="text-slate-600">No books found</p>
                </div>
              )}
            </section>
          )}

          {activeNav === "Borrowing History" && (
            <section className="mt-6">
              <h2 className="text-lg font-bold mb-4">Borrowing History</h2>
              {loading ? (
                <p className="text-slate-500">Loading...</p>
              ) : borrowedBooks.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Book Title</th>
                        <th className="px-6 py-3 text-left font-semibold">Author</th>
                        <th className="px-6 py-3 text-left font-semibold">Status</th>
                        <th className="px-6 py-3 text-left font-semibold">Due Date</th>
                        <th className="px-6 py-3 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowedBooks.map((book) => (
                        <tr key={book.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-6 py-4">{book.book_title || book.title}</td>
                          <td className="px-6 py-4">{book.author}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              book.status === 'overdue' 
                                ? 'bg-red-50 text-red-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}>
                              {book.status?.charAt(0).toUpperCase() + book.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">{new Date(book.due_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRenewBook(book.id)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                              >
                                Renew
                              </button>
                              <button
                                onClick={() => handleReturnBook(book.id)}
                                className="text-xs font-semibold text-red-600 hover:text-red-700"
                              >
                                Return
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <p className="text-slate-600">No borrowing history</p>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

/* Components */

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

function BookCard({ book, onBorrow }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
      <div 
        onClick={() => window.location.href = `/book/${book.id}`}
        className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 cursor-pointer" 
      />
      
      <div className="p-4">
        <h3 
          onClick={() => window.location.href = `/book/${book.id}`}
          className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-blue-600 transition"
        >
          {book.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">{book.author}</p>
        <p className="text-xs text-slate-400 mt-2">ISBN: {book.isbn}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            {book.available_copies} available
          </span>
          <button
            onClick={onBorrow}
            disabled={book.available_copies === 0}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Borrow
          </button>
        </div>
      </div>
    </div>
  );
}

function BorrowedBookCard({ book, onReturn, onRenew }) {
  const isOverdue = book.status === "overdue";
  
  return (
    <div className={`rounded-2xl border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'} p-4 shadow-sm`}>
      <div 
        onClick={() => window.location.href = `/book/${book.book_id || book.id}`}
        className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg mb-3 cursor-pointer" 
      />
      
      <div>
        <h3 
          onClick={() => window.location.href = `/book/${book.book_id || book.id}`}
          className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-blue-600 transition"
        >
          {book.book_title || book.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">{book.author}</p>
        
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
            isOverdue 
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isOverdue ? '⚠️ Overdue' : '✓ Active'}
          </span>
        </div>

        <p className="text-xs text-slate-600 mt-2">
          Due: {book.due_date ? new Date(book.due_date).toLocaleDateString() : 'N/A'}
        </p>

        {book.fine_amount > 0 && (
          <p className="text-xs font-semibold text-red-600 mt-1">
            Fine: ${book.fine_amount.toFixed(2)}
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <button
            onClick={onRenew}
            className="flex-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            Renew
          </button>
          <button
            onClick={onReturn}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
}
