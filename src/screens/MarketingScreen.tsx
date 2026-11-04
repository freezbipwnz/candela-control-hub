import React, { useState, useMemo, useEffect } from 'react';
import { PromoCode, UserRole } from '../types/crm';
import { INITIAL_PROMOS } from '../data/mockData';
import {
  Tag,
  Plus,
  Percent,
  Coins,
  Calendar,
  Users,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Save,
  Eye,
  Trash2,
  X,
  Smartphone,
  Monitor,
  Flame,
  Layers
} from 'lucide-react';

export interface MarketingScreenProps {
  promos?: PromoCode[];
  onTogglePromo?: (promoId: string) => void;
  onAddPromo?: (newPromo: PromoCode) => void;
  currentRole?: UserRole;
}

interface HeroBannerData {
  badge: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  overlayOpacity: number;
  isActive: boolean;
}

const BANNER_PRESETS = [
  {
    name: 'Теплый вечер (Свечи)',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1400',
  },
  {
    name: 'Нордический лес',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1400',
  },
  {
    name: 'Сандал & Эстетика',
    url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1400',
  },
];

export const MarketingScreen: React.FC<MarketingScreenProps> = ({
  promos: initialPromosProp,
  onTogglePromo,
  onAddPromo,
  currentRole = 'OWNER',
}) => {
  // --- Promo codes state ---
  const [localPromos, setLocalPromos] = useState<PromoCode[]>(
    initialPromosProp || INITIAL_PROMOS
  );

  // Sync with prop if it updates
  useEffect(() => {
    if (initialPromosProp) {
      setLocalPromos(initialPromosProp);
    }
  }, [initialPromosProp]);

  const promos = initialPromosProp || localPromos;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'expired'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Modal state ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<'percent' | 'fixed'>('percent');
  const [formValue, setFormValue] = useState<number>(15);
  const [formMinOrder, setFormMinOrder] = useState<number>(3000);
  const [formUsageLimit, setFormUsageLimit] = useState<number>(100);
  const [formStartDate, setFormStartDate] = useState('2026-11-05');
  const [formEndDate, setFormEndDate] = useState('2026-12-05');
  const [formError, setFormError] = useState<string | null>(null);

  // --- Storefront Hero Banner State ---
  const [banner, setBanner] = useState<HeroBannerData>({
    badge: 'Новая осенне-зимняя коллекция',
    headline: 'Ароматы, создающие состояние дома',
    subheadline: 'Селективные интерьерные свечи из натурального воска с медитативным треском деревянного фитиля',
    ctaText: 'Смотреть коллекцию',
    ctaLink: '/catalog/candles',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1400',
    overlayOpacity: 45,
    isActive: true,
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [bannerSavedNotification, setBannerSavedNotification] = useState(false);

  const canManageMarketing = currentRole === 'OWNER' || currentRole === 'ADMIN' || currentRole === 'EDITOR';

  // --- Copy code helper ---
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Toggle promo status ---
  const handleTogglePromo = (id: string) => {
    if (onTogglePromo) {
      onTogglePromo(id);
    } else {
      setLocalPromos((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: !item.isActive } : item
        )
      );
    }
  };

  // --- Delete promo ---
  const handleDeletePromo = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот промокод?')) {
      setLocalPromos((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // --- Generate random code ---
  const handleGenerateCode = () => {
    const prefixes = ['CANDELA', 'WARMTH', 'LUXURY', 'COZY', 'ATELIER', 'AROMA'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setFormCode(`${randomPrefix}${randomSuffix}`);
  };

  // --- Create promo submit ---
  const handleCreatePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      setFormError('Введите код промокода');
      return;
    }
    if (formValue <= 0) {
      setFormError('Размер скидки должен быть больше 0');
      return;
    }

    const cleanCode = formCode.trim().toUpperCase().replace(/\s+/g, '');
    const newPromo: PromoCode = {
      id: `pr-${Date.now()}`,
      code: cleanCode,
      type: formType,
      discountValue: Number(formValue),
      minOrderAmount: Number(formMinOrder),
      usageLimit: Number(formUsageLimit),
      usedCount: 0,
      startDate: formStartDate,
      endDate: formEndDate,
      isActive: true,
    };

    if (onAddPromo) {
      onAddPromo(newPromo);
    } else {
      setLocalPromos([newPromo, ...localPromos]);
    }

    setIsCreateModalOpen(false);
    setFormError(null);
    setFormCode('');
  };

  // --- Filter promos ---
  const filteredPromos = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return promos.filter((promo) => {
      const matchesSearch =
        promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${promo.discountValue}`.includes(searchQuery);

      const isExpired = promo.endDate < today;

      if (!matchesSearch) return false;

      if (statusFilter === 'active') return promo.isActive && !isExpired;
      if (statusFilter === 'paused') return !promo.isActive;
      if (statusFilter === 'expired') return isExpired;

      return true;
    });
  }, [promos, searchQuery, statusFilter]);

  // --- Header Stats ---
  const activePromoCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return promos.filter((p) => p.isActive && p.endDate >= today).length;
  }, [promos]);

  const totalActivations = useMemo(() => {
    return promos.reduce((sum, p) => sum + p.usedCount, 0);
  }, [promos]);

  const totalDiscountsEstimated = useMemo(() => {
    return promos.reduce((sum, p) => {
      if (p.type === 'fixed') {
        return sum + p.usedCount * p.discountValue;
      } else {
        // Average order check approx 3200 ₽
        return sum + Math.round(p.usedCount * 3200 * (p.discountValue / 100));
      }
    }, 0);
  }, [promos]);

  // --- Save banner ---
  const handleSaveBanner = () => {
    setBannerSavedNotification(true);
    setTimeout(() => setBannerSavedNotification(false), 3000);
  };

  return (
    <div className="min-h-screen bg-atelier-bg dark:bg-atelier-dark-bg text-[#2D2A26] dark:text-[#E8E2D9] font-sans p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-atelier-border dark:border-atelier-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase bg-brand-terracotta/10 text-brand-terracotta dark:bg-brand-terracotta-dark/15 dark:text-brand-terracotta-dark">
              <Sparkles className="w-3.5 h-3.5" /> Маркетинг & Промо
            </span>
            <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
              Роль: {currentRole}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-cormorant font-semibold tracking-tight text-[#1C1917] dark:text-[#FBF9F5]">
            Управление промокодами и витриной
          </h1>
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mt-1">
            Гибкая настройка скидочных кампаний, лимитов активаций и промо-баннера витрины
          </p>
        </div>

        {canManageMarketing && (
          <button
            onClick={() => {
              handleGenerateCode();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-terracotta hover:bg-brand-terracotta-hover transition-all shadow-sm hover:shadow active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Создать промокод</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2.5 rounded-lg bg-brand-terracotta/10 text-brand-terracotta dark:text-brand-terracotta-dark group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-medium tracking-wider text-[#78716C] dark:text-[#A8A29E]">
            Активные промокоды
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-cormorant font-bold mt-2 text-[#1C1917] dark:text-[#FBF9F5]">
            {activePromoCount}{' '}
            <span className="text-sm font-sans font-normal text-[#78716C] dark:text-[#A8A29E]">
              из {promos.length}
            </span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Готовы к применению в корзине
          </p>
        </div>

        <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-medium tracking-wider text-[#78716C] dark:text-[#A8A29E]">
            Всего активаций
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-cormorant font-bold mt-2 text-[#1C1917] dark:text-[#FBF9F5]">
            {totalActivations}{' '}
            <span className="text-sm font-sans font-normal text-[#78716C] dark:text-[#A8A29E]">
              заказов
            </span>
          </div>
          <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-brand-terracotta" /> Высокая лояльность покупателей
          </p>
        </div>

        <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-medium tracking-wider text-[#78716C] dark:text-[#A8A29E]">
            Сумма предоставленных скидок
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-cormorant font-bold mt-2 text-[#1C1917] dark:text-[#FBF9F5]">
            {totalDiscountsEstimated.toLocaleString('ru-RU')}{' '}
            <span className="text-sm font-sans font-normal text-[#78716C] dark:text-[#A8A29E]">
              ₽
            </span>
          </div>
          <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-2">
            Расчётная сумма выгоды покупателей
          </p>
        </div>
      </div>

      {/* SECTION 1: PROMO CODES MANAGEMENT */}
      <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
              Действующие промокоды
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] dark:text-[#A8A29E]">
              Мониторинг исчерпания лимитов, дат действия и статусов активности
            </p>
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                placeholder="Поиск кода..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface focus:outline-none focus:border-brand-terracotta"
              />
            </div>

            {/* Status tabs */}
            <div className="inline-flex rounded-lg border border-atelier-border dark:border-atelier-dark-border p-0.5 bg-atelier-surface dark:bg-atelier-dark-surface text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-atelier-card dark:bg-atelier-dark-card text-brand-terracotta shadow-xs font-semibold'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]'
                }`}
              >
                Все ({promos.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  statusFilter === 'active'
                    ? 'bg-atelier-card dark:bg-atelier-dark-card text-brand-terracotta shadow-xs font-semibold'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]'
                }`}
              >
                Активные
              </button>
              <button
                onClick={() => setStatusFilter('paused')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  statusFilter === 'paused'
                    ? 'bg-atelier-card dark:bg-atelier-dark-card text-brand-terracotta shadow-xs font-semibold'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917]'
                }`}
              >
                На паузе
              </button>
            </div>
          </div>
        </div>

        {/* Promo Codes Table */}
        {filteredPromos.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-atelier-border dark:border-atelier-dark-border">
            <Tag className="w-10 h-10 mx-auto text-[#A8A29E] mb-3 stroke-[1.5]" />
            <p className="text-base font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
              Промокоды не найдены
            </p>
            <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1">
              Попробуйте изменить параметры поиска или создайте новый промокод.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-atelier-border dark:border-atelier-dark-border text-[11px] font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                  <th className="py-3 px-4">Код промокода</th>
                  <th className="py-3 px-4">Размер скидки</th>
                  <th className="py-3 px-4">Мин. заказ</th>
                  <th className="py-3 px-4 min-w-[180px]">Использование</th>
                  <th className="py-3 px-4">Срок действия</th>
                  <th className="py-3 px-4 text-center">Статус</th>
                  <th className="py-3 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-atelier-border/60 dark:divide-atelier-dark-border/60 text-sm">
                {filteredPromos.map((promo) => {
                  const percentUsed = Math.min(
                    100,
                    Math.round((promo.usedCount / promo.usageLimit) * 100)
                  );
                  const isNearlyFull = percentUsed >= 90;
                  const isFull = promo.usedCount >= promo.usageLimit;
                  const isCopied = copiedId === promo.id;

                  return (
                    <tr
                      key={promo.id}
                      className="hover:bg-atelier-surface/50 dark:hover:bg-atelier-dark-surface/50 transition-colors"
                    >
                      {/* Code + Copy */}
                      <td className="py-4 px-4 font-mono font-medium">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-brand-terracotta/10 text-brand-terracotta dark:bg-brand-terracotta-dark/15 dark:text-brand-terracotta-dark font-semibold tracking-wider text-xs">
                            {promo.code}
                          </span>
                          <button
                            title="Скопировать промокод"
                            onClick={() => handleCopyCode(promo.code, promo.id)}
                            className="p-1 rounded hover:bg-atelier-border dark:hover:bg-atelier-dark-border text-[#78716C] dark:text-[#A8A29E] transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-4 font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
                        {promo.type === 'percent' ? (
                          <span className="inline-flex items-center gap-1 text-brand-terracotta dark:text-brand-terracotta-dark">
                            <Percent className="w-3.5 h-3.5" /> {promo.discountValue}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            −{promo.discountValue.toLocaleString('ru-RU')} ₽
                          </span>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="py-4 px-4 text-[#78716C] dark:text-[#A8A29E]">
                        от {promo.minOrderAmount.toLocaleString('ru-RU')} ₽
                      </td>

                      {/* Usage limit & progress */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#1C1917] dark:text-[#FBF9F5]">
                              {promo.usedCount}{' '}
                              <span className="text-[#78716C] dark:text-[#A8A29E]">
                                / {promo.usageLimit}
                              </span>
                            </span>
                            <span
                              className={`text-[11px] font-semibold ${
                                isFull
                                  ? 'text-red-500'
                                  : isNearlyFull
                                  ? 'text-amber-500'
                                  : 'text-[#78716C] dark:text-[#A8A29E]'
                              }`}
                            >
                              {percentUsed}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-atelier-surface dark:bg-atelier-dark-surface rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                isFull
                                  ? 'bg-red-500'
                                  : isNearlyFull
                                  ? 'bg-amber-500'
                                  : 'bg-brand-terracotta'
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-4 px-4 text-xs text-[#78716C] dark:text-[#A8A29E]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#A8A29E]" />
                          <span>до {promo.endDate}</span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleTogglePromo(promo.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            promo.isActive
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                              : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              promo.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                            }`}
                          />
                          {promo.isActive ? 'Активен' : 'Пауза'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Удалить промокод"
                            onClick={() => handleDeletePromo(promo.id)}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-[#A8A29E] hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: STOREFRONT HERO BANNER MANAGER */}
      <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-atelier-border dark:border-atelier-dark-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-terracotta" />
              <h2 className="text-xl sm:text-2xl font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
                Главный промо-баннер витрины (Hero Banner)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#78716C] dark:text-[#A8A29E] mt-1">
              Управляйте ключевым визуальным посылом и призывом к действию на стартовом экране Candela
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Device preview switch */}
            <div className="inline-flex rounded-lg border border-atelier-border dark:border-atelier-dark-border p-1 bg-atelier-surface dark:bg-atelier-dark-surface">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-md transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-atelier-card dark:bg-atelier-dark-card text-brand-terracotta shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
                title="Предпросмотр: Десктоп"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-md transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-atelier-card dark:bg-atelier-dark-card text-brand-terracotta shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
                title="Предпросмотр: Смартфон / Telegram WebApp"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveBanner}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-brand-terracotta hover:bg-brand-terracotta-hover text-white transition-all shadow-xs active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить баннер</span>
            </button>
          </div>
        </div>

        {/* Saved Toast Notice */}
        {bannerSavedNotification && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Изменения витринного баннера успешно сохранены и опубликованы в Telegram WebApp!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-atelier-surface dark:bg-atelier-dark-surface border border-atelier-border dark:border-atelier-dark-border">
              <div>
                <span className="text-sm font-medium text-[#1C1917] dark:text-[#FBF9F5]">
                  Отображать баннер на витрине
                </span>
                <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                  Если выключено, витрина открывается сразу с каталога
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBanner({ ...banner, isActive: !banner.isActive })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  banner.isActive ? 'bg-brand-terracotta' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    banner.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Eyebrow badge */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                Маленький бейдж (Eyebrow)
              </label>
              <input
                type="text"
                value={banner.badge}
                onChange={(e) => setBanner({ ...banner, badge: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                Главный заголовок (H1)
              </label>
              <input
                type="text"
                value={banner.headline}
                onChange={(e) => setBanner({ ...banner, headline: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
              />
            </div>

            {/* Subheadline */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                Подзаголовок / Описание
              </label>
              <textarea
                rows={2}
                value={banner.subheadline}
                onChange={(e) => setBanner({ ...banner, subheadline: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta resize-none"
              />
            </div>

            {/* CTA Button Text & Link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                  Текст кнопки CTA
                </label>
                <input
                  type="text"
                  value={banner.ctaText}
                  onChange={(e) => setBanner({ ...banner, ctaText: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                  Ссылка перехода
                </label>
                <input
                  type="text"
                  value={banner.ctaLink}
                  onChange={(e) => setBanner({ ...banner, ctaLink: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                />
              </div>
            </div>

            {/* Image Presets & URL */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                Фоновое изображение
              </label>
              <div className="flex gap-2">
                {BANNER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBanner({ ...banner, imageUrl: preset.url })}
                    className="flex-1 py-1.5 px-2 rounded-lg text-xs border border-atelier-border dark:border-atelier-dark-border hover:border-brand-terracotta truncate transition-colors text-left"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={banner.imageUrl}
                onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })}
                placeholder="URL фонового изображения..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta font-mono"
              />
            </div>

            {/* Dimming overlay slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                <span>Затемнение фона для читаемости</span>
                <span>{banner.overlayOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={banner.overlayOpacity}
                onChange={(e) =>
                  setBanner({ ...banner, overlayOpacity: Number(e.target.value) })
                }
                className="w-full accent-brand-terracotta"
              />
            </div>
          </div>

          {/* Right Column: Live Mockup Preview */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-medium tracking-wider text-[#78716C] dark:text-[#A8A29E] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-terracotta" />
                Живой предпросмотр витрины ({previewDevice === 'desktop' ? 'Десктоп' : 'Mobile WebApp'})
              </span>
              <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                Candela Quiet Luxury Visuals
              </span>
            </div>

            {/* Device Frame */}
            <div
              className={`transition-all duration-300 w-full overflow-hidden shadow-xl border border-atelier-border dark:border-atelier-dark-border bg-[#1C1917] ${
                previewDevice === 'desktop'
                  ? 'rounded-2xl aspect-[16/9] max-h-[380px]'
                  : 'max-w-[320px] rounded-[32px] aspect-[9/16] max-h-[480px] p-2 bg-[#2D2A26] border-4 border-[#3D3A36]'
              }`}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden flex flex-col justify-end p-6 sm:p-8 text-white">
                <img
                  src={banner.imageUrl}
                  alt="Candela Banner"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${banner.overlayOpacity / 100})`,
                  }}
                />

                {/* Brand Watermark */}
                <div className="absolute top-4 left-6 sm:left-8 z-10 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-brand-terracotta-dark" />
                  <span className="text-xs font-serif font-cormorant tracking-[0.2em] uppercase text-white/80">
                    CANDELA HOME
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-2.5 max-w-lg">
                  {banner.badge && (
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-medium bg-white/20 backdrop-blur-md text-[#F4EFEA] border border-white/20">
                      {banner.badge}
                    </span>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-serif font-cormorant font-semibold leading-tight text-white drop-shadow-md">
                    {banner.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#EAE4DC] line-clamp-2 leading-relaxed">
                    {banner.subheadline}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-brand-terracotta text-white shadow hover:bg-brand-terracotta-hover transition-colors"
                    >
                      <span>{banner.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE PROMO CODE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-5 border-b border-atelier-border dark:border-atelier-dark-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-brand-terracotta/10 text-brand-terracotta">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
                    Новый промокод
                  </h3>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    Создайте скидочный купон для клиентов или рекламной кампании
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-[#78716C] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromoSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code Name & Generator */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                  Код промокода (в верхнем регистре)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Например: CANDELAVIP, AUTUMN15"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2.5 text-sm font-mono tracking-wider font-semibold rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="px-3.5 py-2 rounded-lg text-xs font-medium border border-atelier-border dark:border-atelier-dark-border hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface text-[#78716C] dark:text-[#A8A29E] flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
                    <span>Случайный</span>
                  </button>
                </div>
              </div>

              {/* Discount Type: Percent vs Fixed */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                  Тип скидки
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('percent')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                      formType === 'percent'
                        ? 'border-brand-terracotta bg-brand-terracotta/10 text-brand-terracotta font-semibold'
                        : 'border-atelier-border dark:border-atelier-dark-border hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface text-[#78716C]'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    <span>Процентная скидка (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('fixed')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                      formType === 'fixed'
                        ? 'border-brand-terracotta bg-brand-terracotta/10 text-brand-terracotta font-semibold'
                        : 'border-atelier-border dark:border-atelier-dark-border hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface text-[#78716C]'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>Фиксированная сумма (₽)</span>
                  </button>
                </div>
              </div>

              {/* Discount Value & Min Cart Sum */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                    {formType === 'percent' ? 'Процент скидки (%)' : 'Сумма скидки (₽)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formType === 'percent' ? 90 : 50000}
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                    Минимальный чек (₽)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                  />
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                  Лимит использований (кол-во активаций)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={formUsageLimit}
                  onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                />
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-xl border border-dashed border-atelier-border dark:border-atelier-dark-border bg-atelier-surface/50 dark:bg-atelier-dark-surface/50">
                <span className="text-[11px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] block mb-2 font-medium">
                  Предпросмотр отображения для покупателя:
                </span>
                <div className="flex items-center justify-between p-3 rounded-lg bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded bg-brand-terracotta/10 text-brand-terracotta font-mono font-bold text-xs tracking-wider">
                      {formCode || 'ВАШ_КОД'}
                    </span>
                    <span className="text-xs font-medium text-[#1C1917] dark:text-[#FBF9F5]">
                      {formType === 'percent' ? `Скидка ${formValue}%` : `Скидка ${formValue} ₽`}
                    </span>
                  </div>
                  <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    при заказе от {formMinOrder.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-atelier-border dark:border-atelier-dark-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-[#78716C] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-brand-terracotta hover:bg-brand-terracotta-hover transition-colors shadow-xs"
                >
                  Создать промокод
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingScreen;
