import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Search, 
  ChevronLeft, 
  Filter, 
  BookOpen,
  ArrowRight,
  Star,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon
} from "lucide-react";
import booksService from "../../services/booksService";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(searchParams.get("cat") || "All");
  const [categories, setCategories] = useState(["All"]);
  const pageSize = 12;

  const fetchCategories = async () => {
    try {
      const cats = await booksService.getCategories();
      setCategories(["All", ...cats]);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: pageSize,
        search: initialQuery,
      };
      
      if (activeCategory !== "All") {
        params.category = activeCategory;
      }

      const response = await booksService.getAll(params);
      setBooks(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, initialQuery, activeCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query, cat: activeCategory });
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearchParams({ q: initialQuery, cat: cat });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Search Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition shrink-0"
            >
              <ChevronLeft size={20} />
              <span className="md:hidden lg:inline">Home</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="relative flex-1 group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Search size={20} />
               </div>
               <input 
                 type="text"
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 placeholder="Search by title, author, category or ISBN..."
                 className="w-full rounded-2xl bg-slate-100 border-none py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none ring-2 ring-transparent focus:ring-indigo-100 focus:bg-white transition-all"
               />
               <button 
                 type="submit"
                 className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-slate-800"
               >
                 Search
               </button>
            </form>

            <div className="hidden items-center gap-3 lg:flex shrink-0">
               <div className="h-10 w-10 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center overflow-hidden">
                  <img src="https://i.pravatar.cc/100?u=current" alt="user" />
               </div>
               <p className="text-xs font-bold text-slate-900">Search Hub</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-32 space-y-10">
               <div>
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                    <Filter size={16} className="text-indigo-600" />
                    <span>Filter Results</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categories</p>
                    <div className="flex flex-col gap-1">
                       {categories.map(cat => (
                         <button
                           key={cat}
                           onClick={() => handleCategoryChange(cat)}
                           className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${activeCategory === cat 
                             ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                             : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
                         >
                           <span>{cat}</span>
                           {activeCategory === cat ? <ChevronRight size={14} /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>

               {/* Quick Info */}
               <div className="rounded-3xl bg-indigo-900 p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                  <p className="text-[10px] font-black tracking-widest opacity-60 mb-2">PRO TIP</p>
                  <p className="text-sm font-bold leading-relaxed">Try searching by ISBN for 100% accurate identification of textbook editions.</p>
               </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-9">
            <div className="mb-8 flex items-center justify-between px-2">
               <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {initialQuery ? `Results for "${initialQuery}"` : "All Collection"}
                  </h1>
                  <p className="mt-1 text-sm font-bold text-slate-400">
                    Found {totalCount} relevant {totalCount === 1 ? 'match' : 'matches'}
                  </p>
               </div>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} className="h-[400px] rounded-[2.5rem] bg-white border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : books.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {books.map(b => (
                    <SearchResultCard key={b.id} book={b} onClick={() => navigate(`/book/${b.id}`)} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-100 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-30"
                    >
                      <ChevronLeftIcon size={20} />
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
                               onClick={() => setCurrentPage(page)}
                               className={`h-12 w-12 rounded-2xl text-sm font-bold transition ${currentPage === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-200'}`}
                             >
                               {page}
                             </button>
                           )
                         ));
                       })()}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-100 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-30"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-200 bg-white p-24 text-center">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-50 text-slate-300 mb-8">
                  <Search size={48} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">No matches found</h2>
                <p className="mt-2 text-slate-500 font-bold max-w-md">We couldn't find any items matching your research criteria. Try different keywords or browse our main collection.</p>
                <button 
                  onClick={() => { setQuery(""); handleCategoryChange("All"); }}
                  className="mt-10 rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SearchResultCard({ book, onClick }) {
  const isAvailable = book.available_copies > 0;
  
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer rounded-[2.5rem] bg-white p-4 border border-slate-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-100">
         <img 
           src={book.thumbnail || "https://images.unsplash.com/photo-1543004471-240ce47a2a3b?q=80&w=1000&auto=format&fit=crop"} 
           alt={book.title}
           className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
         />
         <div className="absolute right-4 top-4">
            <div className={`rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg ${isAvailable ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isAvailable ? 'Available' : 'Issued'}
            </div>
         </div>
      </div>

      <div className="mt-6 px-1 pb-2">
         <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{book.category}</span>
         <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-900 leading-snug min-h-[2.5rem] group-hover:text-indigo-600 transition">
           {book.title}
         </h3>
         <p className="mt-2 text-sm font-bold text-slate-400">{book.author}</p>
         
         <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
            <div className="flex items-center gap-1.5">
               <Star size={14} fill="currentColor" className="text-amber-400" />
               <span className="text-xs font-bold text-slate-900">{book.average_rating || '4.2'}</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-600">
               <span className="text-xs font-bold">Details</span>
               <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
         </div>
      </div>
    </div>
  );
}
