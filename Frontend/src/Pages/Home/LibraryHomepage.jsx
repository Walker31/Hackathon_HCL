import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MODES } from "../../modals/AuthModal";
import AuthModal from "../../modals/AuthModal";
import booksService from "../../services/booksService";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  BookOpen, 
  Star, 
  Filter, 
  ArrowRight,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";

/**
 * Library Homepage - Premium E-commerce Transformation
 */
export default function LibraryHomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [catSearch, setCatSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState(MODES.STUDENT_LOGIN);

  // Pagination state
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 8; // 8 items per page for a clean grid

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const cats = await booksService.getCategories();
      setCategories(["All", ...cats]);

      // Fetch books
      const params = {
        page: currentPage,
        page_size: pageSize,
        search: query,
        ordering: sortBy === "Newest" ? "-created_at" : "title",
      };
      
      if (activeCategory !== "All") {
        params.category = activeCategory;
      }

      const response = await booksService.getAll(params);
      setBooks(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, query, activeCategory, sortBy]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      setCurrentPage(1);
      fetchInitialData();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  const onStudentLogin = () => {
    setAuthMode(MODES.STUDENT_LOGIN);
    setAuthOpen(true);
  };

  const handleAuthSuccess = (user) => {
    if (user.role === "student") {
      navigate("/student/dashboard");
    } else if (user.role === "administrator") {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-indigo-200 shadow-lg">
              <BookOpen size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">Lumina<span className="text-indigo-600">Lib</span></p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 -mt-1">Campus Network</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {["Browse", "Featured", "Collections", "About"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onStudentLogin}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-slate-200 transition hover:bg-slate-800 hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pb-20 pt-16 lg:pt-24">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-indigo-50 blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-blue-50 blur-3xl opacity-60" />

        <div className="relative mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              <TrendingUp size={14} />
              <span>OVER 5,000+ BOOKS AVAILABLE</span>
            </div>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.1]">
              Escape into a <br />
              <span className="text-indigo-600">World of Knowledge.</span>
            </h1>
            <p className="mt-8 text-lg leading-8 text-slate-600">
              Access the largest digital and physical library collection on campus. 
              Discover bestseller novels, academic journals, and latest research papers with a single click.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-10 flex flex-col gap-3 rounded-[2rem] border border-slate-100 bg-white p-2 shadow-2xl shadow-indigo-100/50 sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="text-slate-400" size={20} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent py-4 text-sm font-medium outline-none placeholder:text-slate-400"
                  placeholder="Search by title, author, or category..."
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:scale-[1.02] active:scale-95"
              >
                Search Catalog
              </button>
            </form>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                     <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-500">
                Joined by <span className="font-bold text-slate-900">2,400+ students</span> this year
              </p>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative aspect-square w-full max-w-lg mx-auto">
               {/* Decorative elements */}
               <div className="absolute -left-4 -top-4 h-24 w-24 rounded-3xl bg-indigo-600/10 backdrop-blur-3xl" />
               <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-blue-600/10 backdrop-blur-3xl" />
               
               <div className="relative h-full w-full rounded-[3rem] bg-indigo-50 border-8 border-white shadow-2xl overflow-hidden group">
                  <img 
                    src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop" 
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110" 
                    alt="Library" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent" />
               </div>

               {/* Floating cards */}
               <div className="absolute -right-8 top-12 rounded-2xl bg-white p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">BESTSELLER</p>
                      <p className="text-sm font-bold text-slate-900">Atomic Habits</p>
                    </div>
                  </div>
               </div>

               <div className="absolute -left-12 bottom-20 rounded-2xl bg-white p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">NEW ARRIVAL</p>
                      <p className="text-sm font-bold text-slate-900">Psychology of Money</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="browse" className="mx-auto max-w-7xl px-6 py-20">
        {/* Navigation & Filters */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore the Collection</h2>
            <p className="mt-1 text-slate-500 font-medium">Find your next favorite book from our curated selection</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-1 shadow-sm border border-slate-100">
               {["Newest", "Title"].map((sort) => (
                 <button
                   key={sort}
                   onClick={() => setSortBy(sort)}
                   className={`rounded-xl px-4 py-2 text-xs font-bold transition ${sortBy === sort ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                   {sort}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* Sidebar / Filters */}
          <aside className="lg:col-span-3">
            <div className="sticky top-28 space-y-8">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-6">
                  <Filter size={18} className="text-indigo-600" />
                  <span>CATEGORIES</span>
                </h3>

                {/* Category Search */}
                <div className="relative mb-6">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={14} />
                  </div>
                  <input 
                    type="text"
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full rounded-xl bg-white border border-slate-100 py-2.5 pl-9 pr-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-200 transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-3">
                  {categories
                    .filter(cat => cat.toLowerCase().includes(catSearch.toLowerCase()))
                    .slice(0, 11) // "All" + top 10
                    .map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${activeCategory === cat 
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' 
                        : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-200 hover:text-indigo-600'}`}
                    >
                      <span className="truncate pr-2">{cat}</span>
                      {activeCategory === cat && <ChevronRight size={14} className="shrink-0" />}
                    </button>
                  ))}
                  {categories.filter(cat => cat.toLowerCase().includes(catSearch.toLowerCase())).length === 0 && (
                    <p className="text-[10px] font-bold text-slate-400 text-center py-4">No categories found</p>
                  )}
                </div>
              </div>

              {/* Promo Widget */}
              <div className="rounded-[2rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <h4 className="text-lg font-bold relative z-10 leading-tight">Join our Book Club & Save!</h4>
                <p className="mt-3 text-xs text-indigo-100 relative z-10 leading-relaxed font-medium">Get early access to premium collections and zero fines on late returns.</p>
                <button className="mt-6 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-600 shadow-lg transition hover:bg-indigo-50 group-hover:gap-3">
                  <span>Learn More</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </aside>

          {/* Book grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-[420px] rounded-[2.5rem] bg-white border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : books.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {books.map((b) => (
                    <BookCard key={b.id} book={b} onAuth={onStudentLogin} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-100 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-30"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                       {(() => {
                         const pages = [];
                         const total = totalPages;
                         const current = currentPage;
                         
                         if (total <= 7) {
                           for (let i = 1; i <= total; i++) pages.push(i);
                         } else {
                           if (current <= 4) {
                             pages.push(1, 2, 3, 4, 5, "...", total);
                           } else if (current >= total - 3) {
                             pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
                           } else {
                             pages.push(1, "...", current - 1, current, current + 1, "...", total);
                           }
                         }

                         return pages.map((page, index) => (
                           page === "..." ? (
                             <span key={`dots-${index}`} className="px-2 text-slate-400 font-bold">...</span>
                           ) : (
                             <button
                               key={page}
                               onClick={() => handlePageChange(page)}
                               className={`h-12 w-12 rounded-2xl text-sm font-bold transition ${currentPage === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-200'}`}
                             >
                               {page}
                             </button>
                           )
                         ));
                       })()}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-100 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-30"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-200 bg-white p-20 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-50 text-slate-300 mb-6">
                  <Search size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No books found</h3>
                <p className="mt-2 text-slate-500 font-medium">Try adjusting your filters or search keywords.</p>
                <button 
                  onClick={() => { setActiveCategory("All"); setQuery(""); setCurrentPage(1); }}
                  className="mt-8 text-sm font-bold text-indigo-600 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white font-bold text-sm">L</div>
                <span className="text-xl font-bold tracking-tight">NITT</span>
              </div>
              <p className="mt-6 text-sm font-medium text-slate-500 leading-relaxed">
                Empowering the next generation of scholars with seamless access to global knowledge.
              </p>
            </div>
            
            <div>
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 font-bold">Catalog</h5>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                {["Library Collections", "Digital Archive", "Physical Books", "Research Papers"].map(link => (
                  <li key={link}><a href="#" className="hover:text-indigo-600 transition">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 font-bold">Support</h5>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                {["Knowledge Base", "Lending Policy", "Contact Staff", "Feedback"].map(link => (
                  <li key={link}><a href="#" className="hover:text-indigo-600 transition">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 font-bold">Campus Access</h5>
              <div className="rounded-2xl bg-slate-50 p-6">
                 <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Library Hours</p>
                 <p className="text-sm font-bold text-slate-900">Mon - Fri: 8AM - 11PM</p>
                 <p className="text-sm font-bold text-slate-900 mt-1">Sat - Sun: 10AM - 6PM</p>
                 <button className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest">See Location ›</button>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-xs font-bold text-slate-400">
            <p>© {new Date().getFullYear()} Lumina Library System. Created for NITT Campus.</p>
            <div className="flex gap-8">
               <a href="#" className="hover:text-slate-900">Privacy Policy</a>
               <a href="#" className="hover:text-slate-900">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

/* ---------- Premium UI pieces ---------- */

function BookCard({ book, onAuth }) {
  const navigate = useNavigate();
  const isAvailable = book.available_copies > 0;
  const rating = book.average_rating || 4.2;

  const goToDetail = () => navigate(`/book/${book.id}`);

  return (
    <div className="group relative flex flex-col rounded-[2.5rem] bg-white p-4 shadow-sm border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100">
      {/* Visual Header */}
      <div 
        onClick={goToDetail}
        className="relative aspect-[4/5] cursor-pointer overflow-hidden rounded-[2rem] bg-slate-100"
      >
        <img 
          src={book.thumbnail || "https://images.unsplash.com/photo-1543004471-240ce47a2a3b?q=80&w=1000&auto=format&fit=crop"} 
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {book.average_rating > 4.5 && (
            <span className="inline-flex rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200">
              Bestseller
            </span>
          )}
          <span className={`inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg ${isAvailable ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isAvailable ? 'Available' : 'Issued'}
          </span>
        </div>

        {/* Quick View Button (hover only) */}
        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
           <button 
             onClick={(e) => { e.stopPropagation(); onAuth(); }}
             className="w-full rounded-2xl bg-white/90 py-3 text-xs font-black uppercase tracking-widest text-slate-900 shadow-xl backdrop-blur-md hover:bg-white active:scale-95 transition"
           >
             Interact & Borrow
           </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 flex flex-1 flex-col px-1 pb-2">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{book.category || 'Collection'}</span>
           <div className="flex items-center gap-1">
              <Star size={12} fill="currentColor" className="text-amber-400" />
              <span className="text-xs font-bold text-slate-900">{rating}</span>
           </div>
        </div>

        <h3 
          onClick={goToDetail}
          className="line-clamp-2 cursor-pointer text-base font-bold text-slate-900 leading-snug min-h-[2.5rem] group-hover:text-indigo-600 transition"
        >
          {book.title}
        </h3>
        <p className="mt-2 text-sm font-bold text-slate-400">{book.author}</p>

        <div className="mt-auto pt-6 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Stock</p>
              <p className="text-sm font-black text-slate-900">{book.available_copies} Copies</p>
           </div>
           
           <button 
             onClick={goToDetail}
             className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-slate-400 transition hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
           >
             <ArrowRight size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}
