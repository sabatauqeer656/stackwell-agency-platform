import { useId, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { IMAGE_ACCEPT, IMAGE_RULES_TEXT, checkImageFile, useUploadImage } from '../../features/admin/imageUpload.js';
import { getApiError } from '../../lib/apiErrors.js';

// A gallery: several pictures, each with a remove button. Choosing files uploads them one after another and adds them
// to the end. `value` is the list of addresses and `onChange(list)` reports a change (plugs into <Controller>).
export default function ImageListField({ label, hint, value, onChange, max, disabled = false }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const upload = useUploadImage();
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState(null); // { done, total } while uploading
  const busy = progress !== null;
  const room = max - value.length;

  const handleChange = async (event) => {
    const files = Array.from(event.target.files ?? []); // copy first: clearing the input below empties the list
    event.target.value = '';
    if (files.length === 0) return;

    const found = [];
    const accepted = [];
    for (const file of files) {
      const issue = checkImageFile(file);
      if (issue) found.push(issue);
      else accepted.push(file);
    }
    if (accepted.length > room) {
      found.push(`Only ${room} more ${room === 1 ? 'image fits' : 'images fit'} (the gallery holds up to ${max}). The extra ${accepted.length - room} ${accepted.length - room === 1 ? 'was' : 'were'} skipped.`);
      accepted.length = Math.max(room, 0);
    }

    // One at a time, so a failure part-way keeps the ones that already worked
    const added = [];
    setProgress({ done: 0, total: accepted.length });
    for (const file of accepted) {
      try {
        const { url } = await upload.mutateAsync(file);
        added.push(url);
      } catch (uploadError) {
        found.push(`"${file.name}": ${getApiError(uploadError).message}`);
      }
      setProgress((current) => ({ ...current, done: current.done + 1 }));
    }
    setProgress(null);
    if (added.length > 0) onChange([...value, ...added]);
    setProblems(found);
  };

  return (
    <div>
      <p id={`${inputId}-label`} className="text-sm font-medium text-slate-700">
        {label}
      </p>

      {value.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, index) => (
            <li key={url} className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, position) => position !== index))}
                disabled={disabled || busy}
                aria-label={`Remove gallery image ${index + 1}`}
                className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          onChange={handleChange}
          disabled={disabled || busy || room <= 0}
          aria-labelledby={`${inputId}-label`}
          tabIndex={-1}
          className="sr-only"
        />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} loading={busy} disabled={disabled || room <= 0}>
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          {busy ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}` : 'Add images'}
        </Button>
        <span className="text-sm text-slate-500">
          {value.length} of {max}
        </span>
      </div>

      <p role="status" className="sr-only">
        {busy ? `Uploading ${progress.total} ${progress.total === 1 ? 'image' : 'images'}` : ''}
      </p>
      {problems.length > 0 ? (
        <ul role="alert" className="mt-2 space-y-1 text-sm text-red-600">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          {hint ? `${hint} ` : ''}
          {IMAGE_RULES_TEXT}
        </p>
      )}
    </div>
  );
}
