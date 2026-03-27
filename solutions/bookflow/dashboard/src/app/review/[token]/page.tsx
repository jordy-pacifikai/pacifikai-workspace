import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { ReviewForm } from './ReviewForm';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface ReviewRequest {
  id: string;
  business_id: string;
  client_name: string | null;
  status: string;
  rating: number | null;
  comment: string | null;
}

interface Business {
  name: string;
  google_review_url: string | null;
}

async function getReviewData(token: string) {
  const sb = supabaseAdmin();

  const { data: review } = await sb
    .from('bookbot_review_requests')
    .select('id, business_id, client_name, status, rating, comment, expires_at')
    .eq('token', token)
    .single();

  if (!review) return null;

  // Check expiry (14 days)
  const expiresAt = (review as Record<string, unknown>).expires_at as string | null;
  if (expiresAt && new Date(expiresAt) < new Date()) return null;

  const { data: business } = await sb
    .from('bookbot_businesses')
    .select('name, google_review_url')
    .eq('id', review.business_id)
    .single();

  // Mark as viewed if still pending/sent
  if (review.status === 'pending' || review.status === 'sent') {
    await sb
      .from('bookbot_review_requests')
      .update({ status: 'viewed' })
      .eq('id', review.id);
  }

  return {
    review: review as ReviewRequest,
    business: business as Business | null,
  };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getReviewData(token);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">Lien invalide</h1>
          <p className="text-gray-400 text-sm">
            Ce lien d&apos;avis n&apos;existe pas ou a expire.
          </p>
        </div>
      </div>
    );
  }

  const { review, business } = data;
  const businessName = business?.name || 'notre etablissement';
  const googleReviewUrl = business?.google_review_url || null;

  if (review.status === 'submitted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="text-center max-w-sm">
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
          <h1 className="text-xl font-bold text-white mb-2">Merci !</h1>
          <p className="text-gray-400 text-sm">
            Votre avis a ete enregistre. Merci pour votre retour !
          </p>
          {review.rating && review.rating >= 4 && googleReviewUrl && (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 px-6 py-3 bg-[#25D366] text-white rounded-xl text-sm font-medium hover:brightness-110 transition-all"
            >
              Laisser un avis sur Google
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Votre avis compte !
          </h1>
          <p className="text-gray-400 text-sm">
            {review.client_name
              ? `${review.client_name}, comment`
              : 'Comment'}{' '}
            s&apos;est passe votre experience chez{' '}
            <span className="text-white font-medium">{businessName}</span> ?
          </p>
        </div>

        <ReviewForm
          token={token}
          googleReviewUrl={googleReviewUrl}
        />
      </div>
    </div>
  );
}
