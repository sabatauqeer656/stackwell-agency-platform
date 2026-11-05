import { Star } from 'lucide-react';

// Five stars, `rating` of them filled. The container is ONE image with a text label, so a screen
// reader says "5 out of 5 stars" once instead of reading five separate icons.
export default function StarRating({ rating, max = 5 }) {
  return (
    <div role="img" aria-label={`${rating} out of ${max} stars`} className="flex gap-0.5">
      {Array.from({ length: max }, (_, index) => (
        <Star
          key={index}
          className={index < rating ? 'h-5 w-5 fill-amber-400 text-amber-400' : 'h-5 w-5 text-slate-300'}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
