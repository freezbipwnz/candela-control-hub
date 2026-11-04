import React, { useState, useMemo, useEffect } from 'react';
import { Review, UserRole } from '../types/crm';
import { INITIAL_REVIEWS } from '../data/mockData';
import {
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Search,
  Sparkles,
  Flame,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight,
  Send,
  X,
  Eye,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronDown,
  Check
} from 'lucide-react';

export interface ReviewsScreenProps {
  reviews?: Review[];
  onUpdateStatus?: (reviewId: string, newStatus: 'published' | 'rejected') => void;
  onBrandReply?: (reviewId: string, replyText: string) => void;
  currentRole?: UserRole;
}

// Predefined luxury response templates
const REPLY_TEMPLATES = [
  {
    title: 'Благодарность за эстетику',
    text: 'Благодарим вас за выбор Candela Home! Мы счастливы, что наш селективный аромат и потрескивающий деревянный фитиль принесли в ваш дом гармонию и тепло.',
  },
  {
    title: 'Рекомендация по уходу за свечой',
    text: 'Спасибо за ваш отзыв! Чтобы свеча радовала вас максимально долго, рекомендуем подрезать фитиль до 4-5 мм перед каждым зажжением и давать воску расплавиться до стенок баночки.',
  },
  {
    title: 'Извинение за задержку логистики',
    text: 'Приносим искренние извинения за задержку доставки со стороны транспортной службы. Рады, что сама свеча и упаковка вам понравились! Начислили на ваш бонусный счёт 300 баллов на следующий заказ.',
  },
];

export const ReviewsScreen: React.FC<ReviewsScreenProps> = ({
  reviews: initialReviewsProp,
  onUpdateStatus,
  onBrandReply,
  currentRole = 'OWNER',
}) => {
  const [localReviews, setLocalReviews] = useState<Review[]>(
    initialReviewsProp || INITIAL_REVIEWS
  );

  useEffect(() => {
    if (initialReviewsProp) {
      setLocalReviews(initialReviewsProp);
    }
  }, [initialReviewsProp]);

  const reviews = initialReviewsProp || localReviews;

  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'pending' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  // Brand Reply Modal state
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('Candela Home Care');

  // Photo Lightbox state
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

  // --- Quick Tab counts ---
  const counts = useMemo(() => {
    return {
      all: reviews.length,
      published: reviews.filter((r) => r.status === 'published').length,
      pending: reviews.filter((r) => r.status === 'pending').length,
      rejected: reviews.filter((r) => r.status === 'rejected').length,
    };
  }, [reviews]);

  // --- Average rating ---
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // --- Filtered reviews ---
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Tab filter
      if (activeTab !== 'all' && r.status !== activeTab) return false;

      // Rating filter
      if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesAuthor = r.authorName.toLowerCase().includes(query);
        const matchesTelegram = r.authorTelegram.toLowerCase().includes(query);
        const matchesProduct = r.productTitle.toLowerCase().includes(query);
        const matchesText = r.text.toLowerCase().includes(query);
        return matchesAuthor || matchesTelegram || matchesProduct || matchesText;
      }

      return true;
    });
  }, [reviews, activeTab, ratingFilter, searchQuery]);

  // --- Moderation Handlers ---
  const handleUpdateStatus = (id: string, newStatus: 'published' | 'rejected' | 'pending') => {
    if (onUpdateStatus && (newStatus === 'published' || newStatus === 'rejected')) {
      onUpdateStatus(id, newStatus);
    } else {
      setLocalReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    }
  };

  const handleDeleteReview = (id: string) => {
    if (confirm('Вы уверены, что хотите безвозвратно удалить этот отзыв?')) {
      setLocalReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // --- Open Reply Modal ---
  const handleOpenReplyModal = (review: Review) => {
    setSelectedReviewForReply(review);
    setReplyText(review.brandReply ? review.brandReply.text : '');
    setReplyAuthor(review.brandReply ? review.brandReply.authorName : 'Candela Home Care');
  };

  // --- Submit Brand Reply ---
  const handleSubmitBrandReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForReply || !replyText.trim()) return;

    if (onBrandReply) {
      onBrandReply(selectedReviewForReply.id, replyText.trim());
    } else {
      const now = new Date();
      const formattedDate = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      setLocalReviews((prev) =>
        prev.map((r) =>
          r.id === selectedReviewForReply.id
            ? {
                ...r,
                status: r.status === 'pending' ? 'published' : r.status,
                brandReply: {
                  text: replyText.trim(),
                  authorName: replyAuthor,
                  repliedAt: formattedDate,
                },
              }
            : r
        )
      );
    }

    setSelectedReviewForReply(null);
    setReplyText('');
  };

  // --- Delete Brand Reply ---
  const handleDeleteBrandReply = (reviewId: string) => {
    if (confirm('Удалить официальный ответ бренда на этот отзыв?')) {
      setLocalReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, brandReply: undefined } : r))
      );
    }
  };

  return (
    <div className="min-h-screen bg-atelier-bg dark:bg-atelier-dark-bg text-[#2D2A26] dark:text-[#E8E2D9] font-sans p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-atelier-border dark:border-atelier-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase bg-brand-terracotta/10 text-brand-terracotta dark:bg-brand-terracotta-dark/15 dark:text-brand-terracotta-dark">
              <Star className="w-3.5 h-3.5 fill-current" /> Отзывы & Репутация
            </span>
            <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
              Роль: {currentRole}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-cormorant font-semibold tracking-tight text-[#1C1917] dark:text-[#FBF9F5]">
            Отзывы клиентов Candela Home
          </h1>
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mt-1">
            Модерация впечатлений покупателей, подтверждение покупок и официальные ответы бренда
          </p>
        </div>

        {/* Header Stats Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Average Rating Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border shadow-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                Средняя оценка
              </div>
              <div className="text-lg font-serif font-cormorant font-bold text-[#1C1917] dark:text-[#FBF9F5] leading-none mt-0.5">
                {averageRating}{' '}
                <span className="text-xs font-sans font-normal text-[#78716C]">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Total Reviews */}
          <div className="px-4 py-2 rounded-xl bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border shadow-xs">
            <div className="text-xs uppercase font-semibold tracking-wider text-[#78716C] dark:text-[#A8A29E]">
              Всего отзывов
            </div>
            <div className="text-lg font-serif font-cormorant font-bold text-[#1C1917] dark:text-[#FBF9F5] leading-none mt-0.5">
              {reviews.length} шт.
            </div>
          </div>

          {/* Pending Moderation Badge */}
          {counts.pending > 0 && (
            <button
              onClick={() => setActiveTab('pending')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all shadow-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>
                <strong>{counts.pending}</strong> требует проверки
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Tab Navigation Bar */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-atelier-border dark:border-atelier-dark-border pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-brand-terracotta text-white shadow-xs'
                  : 'text-[#78716C] dark:text-[#A8A29E] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface'
              }`}
            >
              Все отзывы{' '}
              <span className="ml-1 opacity-80 text-xs font-mono">({counts.all})</span>
            </button>

            <button
              onClick={() => setActiveTab('published')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'published'
                  ? 'bg-brand-terracotta text-white shadow-xs'
                  : 'text-[#78716C] dark:text-[#A8A29E] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface'
              }`}
            >
              Опубликованные{' '}
              <span className="ml-1 opacity-80 text-xs font-mono">({counts.published})</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-brand-terracotta text-white shadow-xs'
                  : 'text-[#78716C] dark:text-[#A8A29E] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface'
              }`}
            >
              <span>Требуют проверки (Pending)</span>
              {counts.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-amber-500 text-white font-mono font-bold">
                  {counts.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'rejected'
                  ? 'bg-brand-terracotta text-white shadow-xs'
                  : 'text-[#78716C] dark:text-[#A8A29E] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface'
              }`}
            >
              Отклоненные{' '}
              <span className="ml-1 opacity-80 text-xs font-mono">({counts.rejected})</span>
            </button>
          </div>

          {/* Search Input & Rating Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Rating Filter */}
            <div className="relative">
              <select
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-card dark:bg-atelier-dark-card text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
              >
                <option value="all">Любой рейтинг</option>
                <option value="5">Только 5 звезд</option>
                <option value="4">4 звезды</option>
                <option value="3">3 звезды</option>
                <option value="2">2 звезды</option>
                <option value="1">1 звезда</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#78716C]" />
            </div>

            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                placeholder="Поиск по автору, товару..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-card dark:bg-atelier-dark-card text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Cards List */}
      {filteredReviews.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-atelier-border dark:border-atelier-dark-border bg-atelier-card/50 dark:bg-atelier-dark-card/50">
          <MessageSquare className="w-12 h-12 mx-auto text-[#A8A29E] mb-3 stroke-[1.5]" />
          <h3 className="text-lg font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
            Отзывы не найдены
          </h3>
          <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1 max-w-sm mx-auto">
            В данной вкладке нет отзывов, удовлетворяющих заданным критериям фильтрации.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredReviews.map((review) => {
            const isPending = review.status === 'pending';
            const isRejected = review.status === 'rejected';

            return (
              <div
                key={review.id}
                className={`bg-atelier-card dark:bg-atelier-dark-card border rounded-2xl p-5 sm:p-6 transition-all shadow-sm ${
                  isPending
                    ? 'border-amber-400/60 dark:border-amber-500/40 ring-1 ring-amber-400/30'
                    : isRejected
                    ? 'border-red-300/40 dark:border-red-900/30 opacity-75'
                    : 'border-atelier-border dark:border-atelier-dark-border'
                }`}
              >
                {/* Review Header: User Info, Product, Rating, Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-atelier-border/70 dark:border-atelier-dark-border/70">
                  <div className="space-y-1.5">
                    {/* Stars + Rating Number + Verified Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-600'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-xs font-bold text-[#1C1917] dark:text-[#FBF9F5]">
                        {review.rating}.0
                      </span>

                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Покупка подтверждена</span>
                        </span>
                      )}

                      {/* Status indicator badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>На модерации</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>Отклонен</span>
                        </span>
                      )}
                    </div>

                    {/* Product & Author */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                      <span className="font-semibold text-brand-terracotta dark:text-brand-terracotta-dark">
                        «{review.productTitle}»
                      </span>
                      <span className="text-[#A8A29E]">•</span>
                      <span className="font-medium text-[#1C1917] dark:text-[#FBF9F5]">
                        {review.authorName}
                      </span>
                      <a
                        href={`https://t.me/${review.authorTelegram.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#78716C] dark:text-[#A8A29E] hover:text-brand-terracotta transition-colors inline-flex items-center gap-0.5"
                      >
                        {review.authorTelegram}
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                      </a>
                    </div>
                  </div>

                  {/* Date & Quick Moderation Actions */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                      {review.createdAt}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {review.status !== 'published' ? (
                        <button
                          onClick={() => handleUpdateStatus(review.id, 'published')}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Опубликовать</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(review.id, 'rejected')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                          title="Скрыть отзыв с витрины"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Скрыть</span>
                        </button>
                      )}

                      {review.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(review.id, 'rejected')}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Отклонить</span>
                        </button>
                      )}

                      <button
                        title="Удалить отзыв"
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-1 rounded-lg text-[#A8A29E] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Review Text Body */}
                <div className="py-4 space-y-3">
                  <p className="text-sm sm:text-base leading-relaxed text-[#2D2A26] dark:text-[#EAE4DC] font-sans">
                    {review.text}
                  </p>

                  {/* Pros & Cons */}
                  {(review.pros || review.cons) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {review.pros && (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-[#2D2A26] dark:text-[#E8E2D9]">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                              Плюсы:
                            </span>
                            <span>{review.pros}</span>
                          </div>
                        </div>
                      )}

                      {review.cons && (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-[#2D2A26] dark:text-[#E8E2D9]">
                          <ThumbsDown className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">
                              Минусы / Замечания:
                            </span>
                            <span>{review.cons}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Olfactory / Attributes */}
                  {review.attributes && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#78716C] dark:text-[#A8A29E]">
                      {review.attributes.longevity && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-atelier-surface dark:bg-atelier-dark-surface border border-atelier-border dark:border-atelier-dark-border">
                          <Flame className="w-3 h-3 text-brand-terracotta" />
                          <span>Стойкость шлейфа: <strong>{review.attributes.longevity}</strong></span>
                        </span>
                      )}
                      {review.attributes.matchesDescription && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-atelier-surface dark:bg-atelier-dark-surface border border-atelier-border dark:border-atelier-dark-border">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Полное соответствие пирамиде аромата</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Attached Buyer Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] font-medium">
                        Прикрепленные фотографии покупателя ({review.photos.length}):
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {review.photos.map((photo, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setActivePhotoUrl(photo)}
                            className="relative group rounded-xl overflow-hidden border border-atelier-border dark:border-atelier-dark-border w-20 h-20 sm:w-24 sm:h-24 transition-transform hover:scale-105 shadow-xs"
                          >
                            <img
                              src={photo}
                              alt="Фото покупателя"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* BRAND REPLY SECTION */}
                <div className="pt-3 border-t border-atelier-border/60 dark:border-atelier-dark-border/60">
                  {review.brandReply ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/70 via-stone-50/50 to-transparent dark:from-amber-950/20 dark:via-stone-900/40 dark:to-transparent border border-amber-400/30 dark:border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Flame className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-serif font-cormorant font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                            Официальный ответ Candela Home
                          </span>
                          <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                            ({review.brandReply.authorName} • {review.brandReply.repliedAt})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenReplyModal(review)}
                            className="p-1 rounded text-[#78716C] hover:text-brand-terracotta hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
                            title="Редактировать ответ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrandReply(review.id)}
                            className="p-1 rounded text-[#78716C] hover:text-red-600 hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
                            title="Удалить ответ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#3D3A36] dark:text-[#E2DDD7] leading-relaxed italic pl-6 border-l-2 border-amber-500/40">
                        «{review.brandReply.text}»
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#78716C] dark:text-[#A8A29E] flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-brand-terracotta" />
                        Нет ответа бренда на этот отзыв
                      </span>
                      <button
                        onClick={() => handleOpenReplyModal(review)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-brand-terracotta dark:text-brand-terracotta-dark bg-brand-terracotta/10 hover:bg-brand-terracotta/15 transition-all shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ответить от лица бренда</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BRAND REPLY MODAL */}
      {selectedReviewForReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-5 border-b border-atelier-border dark:border-atelier-dark-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
                    Официальный ответ Candela Home
                  </h3>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    Клиент: {selectedReviewForReply.authorName} ({selectedReviewForReply.productTitle})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReviewForReply(null)}
                className="p-1.5 rounded-lg text-[#78716C] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBrandReply} className="p-6 space-y-5">
              <div className="p-3.5 rounded-xl bg-atelier-surface dark:bg-atelier-dark-surface border border-atelier-border dark:border-atelier-dark-border text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#78716C] dark:text-[#A8A29E]">
                  <span>Отзыв покупателя ({selectedReviewForReply.rating} ★):</span>
                  <span>{selectedReviewForReply.createdAt}</span>
                </div>
                <p className="text-[#1C1917] dark:text-[#FBF9F5] italic line-clamp-3">
                  «{selectedReviewForReply.text}»
                </p>
              </div>

              {/* Ready-made Templates */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
                  Быстрые премиальные шаблоны ответа
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {REPLY_TEMPLATES.map((tmpl, tIdx) => (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => setReplyText(tmpl.text)}
                      className="p-2.5 rounded-lg text-left text-xs border border-atelier-border dark:border-atelier-dark-border hover:border-brand-terracotta bg-atelier-surface/40 dark:bg-atelier-dark-surface/40 transition-colors"
                    >
                      <div className="font-medium text-[#1C1917] dark:text-[#FBF9F5] truncate mb-0.5">
                        {tmpl.title}
                      </div>
                      <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] line-clamp-2">
                        {tmpl.text}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Signatory Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                  Подпись представителя бренда
                </label>
                <select
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                >
                  <option value="Candela Home Care">Служба заботы Candela Home Care</option>
                  <option value="Команда парфюмеров Candela">Команда парфюмеров Candela</option>
                  <option value="Александр (Основатель Candela)">Александр, основатель мастерской</option>
                </select>
              </div>

              {/* Reply Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                    Текст ответа
                  </label>
                  <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                    {replyText.length} символов
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Напишите внимательный, вежливый ответ в тональности тихого люкса..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                />
              </div>

              {/* Live Preview */}
              {replyText.trim() && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-400/30 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-serif font-cormorant font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Предпросмотр: {replyAuthor}</span>
                  </div>
                  <p className="text-[#2D2A26] dark:text-[#E8E2D9] italic leading-relaxed">
                    «{replyText}»
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-atelier-border dark:border-atelier-dark-border">
                <button
                  type="button"
                  onClick={() => setSelectedReviewForReply(null)}
                  className="px-4 py-2 rounded-lg text-sm text-[#78716C] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white bg-brand-terracotta hover:bg-brand-terracotta-hover transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Опубликовать ответ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setActivePhotoUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhotoUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhotoUrl}
              alt="Увеличенное фото покупателя"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsScreen;
