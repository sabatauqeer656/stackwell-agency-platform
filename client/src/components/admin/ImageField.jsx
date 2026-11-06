import { useId, useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { IMAGE_ACCEPT, IMAGE_RULES_TEXT, checkImageFile, useUploadImage } from '../../features/admin/imageUpload.js';
import { getApiError } from '../../lib/apiErrors.js';
import { cn } from '../../lib/utils.js';

// One picture: shows it, lets you choose a new one (it is uploaded at once) or remove it.
// `value` is the image's address ('' for none) and `onChange(address)` reports a change, so it plugs into
// React Hook Form's <Controller>. Nothing is saved to the team member / project until that form is saved.
//   shape - 'wide' (a cover image) or 'round' (a person's photo)
export default function ImageField({ label, hint, value, onChange, error, shape = 'wide', disabled = false }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const upload = useUploadImage();
  const [problem, setProblem] = useState('');
  const [brokenSrc, setBrokenSrc] = useState(null); // WHICH address failed to load, so a new image gets a fresh chance
  const busy = upload.isPending;

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // so choosing the SAME file again afterwards still triggers a change
    if (!file) return;

    const issue = checkImageFile(file);
    if (issue) {
      setProblem(issue);
      return;
    }
    setProblem('');
    try {
      const { url } = await upload.mutateAsync(file);
      onChange(url);
    } catch (uploadError) {
      setProblem(getApiError(uploadError).message);
    }
  };

  const message = problem || error;
  const showPreview = Boolean(value) && brokenSrc !== value;

  return (
    <div>
      <p id={`${inputId}-label`} className="text-sm font-medium text-slate-700">
        {label}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-slate-300 bg-slate-50 text-slate-400',
            shape === 'round' ? 'h-24 w-24 rounded-full' : 'aspect-video w-full max-w-xs rounded-lg'
          )}
        >
          {showPreview ? (
            <img src={value} alt="" onError={() => setBrokenSrc(value)} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-7 w-7" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* The real file input is hidden; the button opens it. It still works with the keyboard and screen readers. */}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleChange}
            disabled={disabled || busy}
            aria-labelledby={`${inputId}-label`}
            tabIndex={-1}
            className="sr-only"
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} loading={busy} disabled={disabled}>
            {value ? 'Replace image' : 'Choose image'}
          </Button>
          {value && !busy && (
            <Button type="button" variant="ghost" onClick={() => onChange('')} disabled={disabled} aria-label={`Remove ${label.toLowerCase()}`}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {value && brokenSrc === value && <p className="mt-2 text-sm text-amber-700">The current image could not be shown. Choose a new one.</p>}
      <p role="status" className="sr-only">
        {busy ? 'Uploading the image' : ''}
      </p>
      {message ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {message}
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          {hint ? `${hint} ` : ''}
          {IMAGE_RULES_TEXT}
        </p>
      )}
    </div>
  );
}
