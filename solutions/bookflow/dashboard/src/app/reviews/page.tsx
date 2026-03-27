'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useReviews } from '@/hooks/useReviews';
import type { ReviewRequest } from '@/hooks/useReviews';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Star display ─────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={s <= rating ? '#FBBF24' : 'none'}
          stroke="#FBBF24"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReviewRequest['status'] }) {
  const styles: Record<ReviewRequest['status'], string> = {
    pending: 'bg-gray-800 text-gray-400',
    sent: 'bg-blue-900/50 text-blue-400',
    viewed: 'bg-amber-900/50 text-amber-400',
    submitted: 'bg-emerald-900/50 text-emerald-400',
  };
  const labels: Record<ReviewRequest['status'], string> = {
    pending: 'En attente',
    sent: 'Envoye',
    viewed: 'Consulte',
    submitted: 'Soumis',
  };

  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full', styles[status])}>
      {labels[status]}
    </span>
  );
}

// ─── Stats cards ──────────────────────────────────────────────────────────────

function StatsCards({ reviews }: { reviews: ReviewRequest[] }) {
  const submitted = reviews.filter((r) => r.status === 'submitted');
  const totalReviews = submitted.length;
  const avgRating =
    totalReviews > 0
      ? submitted.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalReviews
      : 0;
  const responseRate =
    reviews.length > 0 ? Math.round((totalReviews / reviews.length) * 100) : 0;

  const stats = [
    {
      label: 'Note moyenne',
      value: avgRating > 0 ? avgRating.toFixed(1) : '—',
      icon: Star,
      color: '#FBBF24',
      suffix: avgRating > 0 ? '/5' : '',
    },
    {
      label: 'Avis recus',
      value: totalReviews.toString(),
      icon: MessageSquare,
      color: '#25D366',
    },
    {
      label: 'Taux de reponse',
      value: `${responseRate}%`,
      icon: TrendingUp,
      color: '#3b82f6',
    },
    {
      label: 'Total envoyes',
      value: reviews.length.toString(),
      icon: Users,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon
              className="w-4 h-4"
              style={{ color: stat.color }}
            />
            <span className="text-xs text-gray-500">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stat.value}
            {stat.suffix && (
              <span className="text-sm font-normal text-gray-500">
                {stat.suffix}
              </span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const { businessId, businessName } = useAppStore();
  const { data: reviews, isLoading } = useReviews(businessId);

  return (
    <DashboardLayout title="Avis clients" businessName={businessName ?? undefined}>
      <div className="space-y-6">
        {/* Stats */}
        {!isLoading && reviews && <StatsCards reviews={reviews} />}

        {/* Reviews list */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[1.5fr_100px_2fr_100px_130px] gap-4 px-6 py-3 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>Client</span>
            <span>Note</span>
            <span>Commentaire</span>
            <span>Statut</span>
            <span>Date</span>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="divide-y divide-gray-800">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <SkeletonRow />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!reviews || reviews.length === 0) && (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Aucun avis pour le moment</p>
              <p className="text-gray-600 text-xs">
                Les demandes d&apos;avis seront envoyees automatiquement apres chaque rendez-vous.
              </p>
            </div>
          )}

          {/* Mobile cards */}
          {!isLoading && reviews && reviews.length > 0 && (
            <div className="md:hidden divide-y divide-gray-800">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">
                      {review.client_name || 'Client'}
                    </span>
                    <StatusBadge status={review.status} />
                  </div>
                  {review.rating && <Stars rating={review.rating} />}
                  {review.comment && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    {review.created_at
                      ? format(new Date(review.created_at), 'd MMM yyyy', {
                          locale: fr,
                        })
                      : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Desktop rows */}
          {!isLoading &&
            reviews &&
            reviews.length > 0 && (
              <div className="hidden md:block divide-y divide-gray-800/50">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="grid grid-cols-[1.5fr_100px_2fr_100px_130px] gap-4 px-6 py-4 items-center hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Client */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] text-sm font-semibold shrink-0">
                        {(review.client_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium truncate">
                        {review.client_name || 'Client'}
                      </span>
                    </div>

                    {/* Rating */}
                    <div>
                      {review.rating ? (
                        <Stars rating={review.rating} />
                      ) : (
                        <span className="text-gray-600 text-sm">—</span>
                      )}
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-gray-400 truncate">
                      {review.comment || (
                        <span className="text-gray-600 italic">Pas de commentaire</span>
                      )}
                    </p>

                    {/* Status */}
                    <StatusBadge status={review.status} />

                    {/* Date */}
                    <span className="text-sm text-gray-500">
                      {review.created_at
                        ? format(new Date(review.created_at), 'd MMM yyyy', {
                            locale: fr,
                          })
                        : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
