import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Star, 
  Clock, 
  BookOpen, 
  Share2, 
  Heart,
  ArrowRight,
  ShieldCheck,
  Globe,
  Layout,
  MessageCircle
} from "lucide-react";
import booksService from "../../services/booksService";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await booksService.getById(id);
        setBook(data);
      } catch (err) {
        console.error("Failed to fetch book detail:", err);
        setError("Book not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Oops!</h1>
        <p className="mt-2 text-slate-600">{error || "Something went wrong."}</p>
        <button 
          onClick={() => navigate("/")}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-200"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isAvailable = book.available_copies > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition shadow-sm">
              <Heart size={20} />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition shadow-sm">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-10 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left: Book Cover Visual */}
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[3rem] bg-white shadow-2xl shadow-slate-200 lg:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent" />
                <img 
                  src={book.thumbnail || "https://images.unsplash.com/photo-1543004471-240ce47a2a3b?q=80&w=1000&auto=format&fit=crop"} 
                  alt={book.title}
                  className="h-full w-full object-cover rounded-[2rem] shadow-2xl transform hover:scale-105 transition duration-700"
                />
              </div>

              {/* Quick Stats below cover */}
              <div className="mt-10 grid grid-cols-3 gap-4">
                <div className="rounded-3xl bg-white p-4 text-center border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pages</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{book.num_pages || '---'}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 text-center border border-slate-100 shadow-sm font-bold">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Year</p>
                  <p className="mt-1 text-sm text-slate-900">{book.published_year || '---'}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 text-center border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-slate-900">
                    <Star size={14} className="text-amber-400" fill="currentColor" />
                    <span>{book.average_rating || '4.2'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Book Details & Actions */}
          <div className="lg:col-span-7">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-50 px-4 py-1 text-xs font-bold text-indigo-600 border border-indigo-100">
                  {book.category || 'General Collection'}
                </span>
                {isAvailable ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <ShieldCheck size={16} />
                    Available for Borrowing
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                    <Clock size={16} />
                    Currently Issued
                  </span>
                )}
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl leading-tight">
                {book.title}
              </h1>
              
              <p className="mt-4 text-lg font-bold text-slate-500">
                by <span className="text-slate-900">{book.author}</span>
              </p>

              <div className="mt-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">About this book</h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600 font-medium">
                  {book.description || "The user hasn't provided a description for this specific title. This work remains one of the highly referenced materials in its category within our campus network."}
                </p>
              </div>

              {/* Meta Info Grid */}
              <div className="mt-12 grid grid-cols-2 gap-8 border-y border-slate-100 py-10">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ISBN Code</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{book.isbn}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <Layout size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Language</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">English (Global)</p>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="mt-12 rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-xl shadow-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Available Stock</p>
                    <p className="text-2xl font-black text-slate-900">{book.available_copies} Copies</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="user" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">Highly requested</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button 
                    disabled={!isAvailable}
                    className="flex-1 rounded-2xl bg-indigo-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                    onClick={() => navigate('/student/dashboard')}
                  >
                    {isAvailable ? "Proceed to Borrow" : "Reservations Full"}
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-slate-800 active:scale-95">
                    <MessageCircle size={18} />
                    <span>Inquiry</span>
                  </button>
                </div>
                
                <p className="mt-6 text-center text-xs font-bold text-slate-400">
                  Borrowed items must be returned within 14 days to avoid network fines.
                </p>
              </div>

              {/* Related/Tags Section */}
              <div className="mt-16">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Topic Explorations</h3>
                 <div className="flex flex-wrap gap-2">
                    {["Academic", "Reference", "Library Choice", "NITT Recommended", "Standard Edition"].map(tag => (
                      <span key={tag} className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-500 border border-slate-100">#{tag}</span>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Recommended Section (Simplified for Detail Page) */}
      <section className="mx-auto max-w-7xl px-6 mt-32">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
           <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">More from <span className="text-indigo-600">{book.category}</span></h2>
           <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all">
             <span>Explore Collection</span>
             <ArrowRight size={18} />
           </button>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-8 mask-fade-right">
           {[1,2,3,4].map(i => (
             <div key={i} className="min-w-[240px] rounded-[2rem] bg-white p-4 border border-slate-100 shadow-sm animate-pulse">
                <div className="aspect-[3/4] rounded-2xl bg-slate-50" />
                <div className="mt-4 h-4 w-3/4 rounded-full bg-slate-50" />
                <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-50" />
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
