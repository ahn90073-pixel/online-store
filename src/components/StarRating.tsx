import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: number;
}

export default function StarRating({ rating, reviews, size = 14 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" dir="ltr">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                size={size}
                className="text-amber-400 fill-amber-400"
              />
            );
          }
          if (i === fullStars && hasHalf) {
            return (
              <div key={i} className="relative" style={{ width: size, height: size }}>
                <Star size={size} className="text-gray-300 fill-gray-300 absolute" />
                <div className="overflow-hidden absolute" style={{ width: size / 2 }}>
                  <Star size={size} className="text-amber-400 fill-amber-400" />
                </div>
              </div>
            );
          }
          return (
            <Star key={i} size={size} className="text-gray-300 fill-gray-300" />
          );
        })}
      </div>
      {reviews !== undefined && (
        <span className="text-xs text-gray-500">({reviews})</span>
      )}
    </div>
  );
}
