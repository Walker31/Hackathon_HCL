import React, { useMemo, useRef, useState, useEffect } from "react";

export default function AddNewBookModal({ open, onClose, onSave, editingBook = null }) {
  const genres = useMemo(
    () => ["Fiction", "Finance", "Technology", "Self-help", "History", "Psychology"],
    []
  );

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    available_copies: 1,
    description: "",
  });

  const [coverFile, setCoverFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset or pre-fill when open or editingBook changes
  useEffect(() => {
    if (open) {
      if (editingBook) {
        setForm({
          title: editingBook.title || "",
          author: editingBook.author || "",
          isbn: editingBook.isbn || "",
          genre: editingBook.category || "",
          available_copies: editingBook.qty || 1,
          description: editingBook.description || "",
        });
      } else {
        setForm({ title: "", author: "", isbn: "", genre: "", available_copies: 1, description: "" });
        setCoverFile(null);
      }
      setErrors({});
    }
  }, [open, editingBook]);

  if (!open) return null;

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.author.trim()) e.author = "Author is required";
    if (!form.isbn.trim()) e.isbn = "ISBN is required";
    if (!form.genre) e.genre = "Genre is required";
    if (!form.available_copies || Number(form.available_copies) < 0) e.available_copies = "Min quantity is 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload = {
      ...form,
      available_copies: Number(form.available_copies),
      category: form.genre,
      // thumbnail: coverFile ? ... : undefined (handling as string URL/base64 for simplicity if needed, or keeping existing)
    };

    if (editingBook) {
      payload.id = editingBook.id;
    }

    onSave?.(payload);
    onClose?.();
  }

  function pickFile() {
    fileInputRef.current?.click();
  }

  function acceptFile(file) {
    if (!file) return;
    const okTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    const maxBytes = 10 * 1024 * 1024;

    if (!okTypes.includes(file.type)) {
      setErrors((p) => ({ ...p, cover: "Only PNG, JPG, GIF, WEBP allowed" }));
      return;
    }
    if (file.size > maxBytes) {
      setErrors((p) => ({ ...p, cover: "Max file size is 10MB" }));
      return;
    }

    setErrors((p) => {
      const { cover, ...rest } = p;
      return rest;
    });
    setCoverFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    acceptFile(file);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add New Book"
      onMouseDown={(e) => {
        // click outside to close
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingBook ? "Edit Book" : "Add New Book"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingBook 
                ? "Update the details of this book in the library system." 
                : "Enter details to catalog a new book in the library system."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="grid gap-4">
            {/* Title */}
            <Field label="Book Title" error={errors.title}>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. The Midnight Library"
                className={inputClass(errors.title)}
              />
            </Field>

            {/* Row 1: Author + ISBN */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Author" error={errors.author}>
                <input
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
                  placeholder="e.g. Matt Haig"
                  className={inputClass(errors.author)}
                />
              </Field>

              <Field label="ISBN" error={errors.isbn}>
                <input
                  value={form.isbn}
                  onChange={(e) => set("isbn", e.target.value)}
                  placeholder="978-0-XXX-XXXX-X"
                  className={inputClass(errors.isbn)}
                />
              </Field>
            </div>

            {/* Row 2: Genre + Quantity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Genre" error={errors.genre}>
                <select
                  value={form.genre}
                  onChange={(e) => set("genre", e.target.value)}
                  className={inputClass(errors.genre)}
                >
                  <option value="">Select Genre</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Quantity" error={errors.available_copies}>
                <input
                  type="number"
                  min={0}
                  value={form.available_copies}
                  onChange={(e) => set("available_copies", e.target.value)}
                  className={inputClass(errors.available_copies)}
                />
              </Field>
            </div>

            {/* Description */}
            <Field label="Description" error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Enter book description..."
                rows={3}
                className={inputClass(errors.description) + " py-2 h-auto"}
              />
            </Field>

            {/* Upload */}
            <Field label="Upload Cover Image" error={errors.cover}>
              <div
                onClick={pickFile}
                onDragEnter={() => setDragOver(true)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={[
                  "cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition",
                  dragOver ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50",
                ].join(" ")}
              >
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-600 shadow-sm">
                  ☁
                </div>

                {!coverFile ? (
                  <>
                    <p className="mt-3 text-sm font-semibold text-blue-600">
                      Upload a file <span className="text-slate-400">or drag and drop</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                ) : (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-slate-900">{coverFile.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(coverFile.size / (1024 * 1024)).toFixed(2)} MB • {coverFile.type}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverFile(null);
                      }}
                      className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Remove file
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
          >
            {editingBook ? "Update Book" : "Save Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

function inputClass(error) {
  return [
    "h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none",
    "placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200",
    error ? "border-red-300" : "border-slate-200 focus:border-blue-300",
  ].join(" ");
}
