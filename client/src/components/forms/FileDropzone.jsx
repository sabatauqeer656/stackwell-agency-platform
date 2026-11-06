import { useId, useState } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { ACCEPT, MAX_FILES, RULES_TEXT, formatBytes } from '../../features/quotes/attachmentRules.js';

// A place to drop files, or click to choose them. Drag-and-drop is only a shortcut:
// the real control is a normal <input type="file"> inside a <label>. That means keyboard users can reach it
// (Tab, then Enter or Space opens the file dialog), and screen readers announce its label and the rules.
//
//   files    - the chosen File objects (the parent owns them)
//   problems - plain-English reasons why some files were refused (from the browser or from the server)
//   onAdd    - called with the newly chosen files; onRemove - called with the index to remove
//   ref      - the file input, so the parent can move focus to it (React 19: ref is a normal prop)
export default function FileDropzone({ files, problems = [], onAdd, onRemove, disabled = false, ref }) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const full = files.length >= MAX_FILES;

  const add = (incoming) => {
    if (incoming.length === 0) return;
    onAdd(incoming);
    setAnnouncement(`${incoming.length} ${incoming.length === 1 ? 'file' : 'files'} selected.`);
  };

  const handleChange = (event) => {
    add(Array.from(event.target.files)); // copy the list first: clearing the input below empties it
    event.target.value = ''; // so choosing the SAME file again afterwards still triggers a change
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) add(Array.from(event.dataTransfer.files));
  };

  const remove = (index) => {
    const name = files[index].name;
    onRemove(index);
    setAnnouncement(`${name} removed.`);
    ref?.current?.focus(); // the Remove button just disappeared: put focus somewhere sensible, not nowhere
  };

  return (
    <div>
      <p className="text-base font-semibold text-ink">
        Attach files <span className="font-normal text-slate-500">(optional)</span>
      </p>

      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault(); // without this the browser would open the dropped file instead
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          // dragleave also fires when moving over a child element: only react when really leaving
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          'mt-3 flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-500',
          dragging ? 'border-brand-600 bg-brand-50' : 'border-slate-300 hover:border-slate-400',
          (disabled || full) && 'cursor-not-allowed opacity-60'
        )}
      >
        <input
          ref={ref}
          id={id}
          type="file"
          multiple
          accept={ACCEPT}
          disabled={disabled || full}
          onChange={handleChange}
          aria-describedby={`${id}-rules`}
          className="sr-only"
        />
        <UploadCloud className="h-8 w-8 text-brand-600" aria-hidden="true" />
        <span className="font-medium text-ink">
          {full ? 'Maximum number of files reached' : (
            <>
              Drag files here or <span className="text-brand-700 underline">browse</span>
            </>
          )}
        </span>
        <span id={`${id}-rules`} className="text-sm text-slate-500">
          {RULES_TEXT}
        </span>
      </label>

      {/* Spoken (not shown) when files are added or removed */}
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {problems.length > 0 && (
        <ul role="alert" className="mt-3 space-y-1 text-sm text-red-600">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul aria-label="Attached files" className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <FileText className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate font-medium text-ink">{file.name}</span>
              <span className="shrink-0 text-sm text-slate-500">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${file.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
