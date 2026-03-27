'use client';

import { useState } from 'react';

interface ReviewFormProps {
  token: string;
  googleReviewUrl: string | null;
}

function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      {half ? (
        <>
          <defs>
            <clipPath id="half-star">
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="#FBBF24"
            clipPath="url(#half-star)"
          />
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="#FBBF24"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      ) : (
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={filled ? '#FBBF24' : 'none'}
          stroke="#FBBF24"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function ReviewForm({ token, googleReviewUrl }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Veuillez donner une note');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, comment: comment.trim() || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la soumission');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Merci !</h2>
        <p className="text-gray-400 text-sm mb-6">
          Votre avis a ete enregistre avec succes.
        </p>
        {rating >= 4 && googleReviewUrl && (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-[#25D366] text-white rounded-xl text-sm font-medium hover:brightness-110 transition-all"
          >
            Laisser un avis sur Google
          </a>
        )}
      </div>
    );
  }

  const displayRating = hoveredRating || rating;

  const ratingLabels = ['', 'Mauvais', 'Moyen', 'Bien', 'Tres bien', 'Excellent'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Star rating */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <p className="text-sm text-gray-400 text-center mb-4">Donnez une note</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={`${star} etoile${star > 1 ? 's' : ''}`}
            >
              <StarIcon filled={star <= displayRating} />
            </button>
          ))}
        </div>
        {displayRating > 0 && (
          <p className="text-center text-sm text-amber-400 mt-2 font-medium">
            {ratingLabels[displayRating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <label className="block text-sm text-gray-400 mb-2">
          Un commentaire ? (optionnel)
        </label>
        <textarea
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#25D366] focus:outline-none rounded-xl px-4 py-3 text-sm resize-none"
          rows={4}
          placeholder="Partagez votre experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
        />
        <p className="text-xs text-gray-600 text-right mt-1">
          {comment.length}/1000
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full py-3.5 rounded-xl text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
        style={{ backgroundColor: '#25D366' }}
      >
        {submitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
      </button>
    </form>
  );
}
