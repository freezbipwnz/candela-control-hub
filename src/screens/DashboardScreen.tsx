import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  PackageCheck,
  ShoppingBag,
  Coins,
  Download,
  FileText,
  Clock,
  ChevronRight,
  CheckCircle2,
  Flame,
  Star,
  RefreshCw,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { DashboardKPI, Order, Product } from '../types/crm';
import { INITIAL_KPI, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/mockData';

export type TimePeriod = 'today' | 'yesterday' | '7days' | 'month' | 'quarter';

interface ChartPoint {
  label: string;
  sublabel?: string;
  revenue: number;
  orders: number;
}

interface PeriodData {
  periodLabel: string;
  comparisonLabel: string;
  kpi: DashboardKPI;
  chartPoints: ChartPoint[];
  categories: {
    id: string;
    name: string;
    percentage: number;
    revenue: number;
    units: number;
    color: string;
  }[];
}

export interface DashboardScreenProps {
  kpi?: DashboardKPI;
  orders?: Order[];
  products?: Product[];
  onNavigateToOrders?: () => void;
  onNavigateToCatalog?: () => void;
  setActiveScreen?: (screenId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  kpi: propKpi,
  orders: propOrders,
  products: propProducts,
  onNavigateToOrders,
  onNavigateToCatalog,
  setActiveScreen
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const effectiveKpi = propKpi || INITIAL_KPI;
  const effectiveProducts = propProducts || INITIAL_PRODUCTS;
  const effectiveOrders = propOrders || INITIAL_ORDERS;

  // Active orders needing assembly: PENDING_PAYMENT / PAID / PACKING
  const realActiveOrdersCount = useMemo(() => {
    return effectiveOrders.filter(o => o.status === 'PAID' || o.status === 'PACKING').length || effectiveKpi.activeOrdersCount;
  }, [effectiveOrders, effectiveKpi]);

  const handleNavigateToOrders = () => {
    if (onNavigateToOrders) onNavigateToOrders();
    else if (setActiveScreen) setActiveScreen('orders');
  };

  const handleNavigateToCatalog = () => {
    if (onNavigateToCatalog) onNavigateToCatalog();
    else if (setActiveScreen) setActiveScreen('catalog');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Period datasets
  const PERIOD_DATA: Record<TimePeriod, PeriodData> = useMemo(() => ({
    today: {
      periodLabel: 'Сегодня',
      comparisonLabel: 'к вчерашнему дню',
      kpi: {
        revenue: 48650,
        revenueGrowthPercent: 18.2,
        netProfit: 29190,
        ordersCount: 16,
        averageCheck: 3040,
        activeOrdersCount: realActiveOrdersCount,
        conversionRate: 4.8
      },
      chartPoints: [
        { label: '08:00', revenue: 2540, orders: 1 },
        { label: '10:00', revenue: 5080, orders: 2 },
        { label: '12:00', revenue: 9800, orders: 3 },
        { label: '14:00', revenue: 14200, orders: 4 },
        { label: '16:00', revenue: 6400, orders: 2 },
        { label: '18:00', revenue: 7600, orders: 3 },
        { label: '20:00', revenue: 3030, orders: 1 }
      ],
      categories: [
        { id: 'candles', name: 'Свечи из соевого воска', percentage: 58, revenue: 28217, units: 11, color: '#B8683D' },
        { id: 'diffusers', name: 'Диффузоры интерьерные', percentage: 24, revenue: 11676, units: 4, color: '#D9875A' },
        { id: 'sachets', name: 'Флорентийские саше', percentage: 12, revenue: 5838, units: 6, color: '#D97706' },
        { id: 'sets', name: 'Подарочные сеты', percentage: 6, revenue: 2919, units: 1, color: '#A39B92' }
      ]
    },
    yesterday: {
      periodLabel: 'Вчера',
      comparisonLabel: 'к предыдущему дню',
      kpi: {
        revenue: 61200,
        revenueGrowthPercent: 12.5,
        netProfit: 36720,
        ordersCount: 20,
        averageCheck: 3060,
        activeOrdersCount: realActiveOrdersCount,
        conversionRate: 4.5
      },
      chartPoints: [
        { label: '08:00', revenue: 3800, orders: 1 },
        { label: '10:00', revenue: 8400, orders: 3 },
        { label: '12:00', revenue: 12600, orders: 4 },
        { label: '14:00', revenue: 16800, orders: 5 },
        { label: '16:00', revenue: 7900, orders: 3 },
        { label: '18:00', revenue: 8200, orders: 3 },
        { label: '20:00', revenue: 3500, orders: 1 }
      ],
      categories: [
        { id: 'candles', name: 'Свечи из соевого воска', percentage: 58, revenue: 35496, units: 14, color: '#B8683D' },
        { id: 'diffusers', name: 'Диффузоры интерьерные', percentage: 24, revenue: 14688, units: 5, color: '#D9875A' },
        { id: 'sachets', name: 'Флорентийские саше', percentage: 12, revenue: 7344, units: 8, color: '#D97706' },
        { id: 'sets', name: 'Подарочные сеты', percentage: 6, revenue: 3672, units: 1, color: '#A39B92' }
      ]
    },
    '7days': {
      periodLabel: 'Последние 7 дней',
      comparisonLabel: 'к предыдущей неделе',
      kpi: {
        revenue: 384500,
        revenueGrowthPercent: 19.4,
        netProfit: 230700,
        ordersCount: 126,
        averageCheck: 3051,
        activeOrdersCount: realActiveOrdersCount,
        conversionRate: 4.7
      },
      chartPoints: [
        { label: 'Пн, 29 окт', revenue: 42000, orders: 14 },
        { label: 'Вт, 30 окт', revenue: 48500, orders: 16 },
        { label: 'Ср, 31 окт', revenue: 56200, orders: 18 },
        { label: 'Чт, 01 ноя', revenue: 49800, orders: 16 },
        { label: 'Пт, 02 ноя', revenue: 64100, orders: 21 },
        { label: 'Сб, 03 ноя', revenue: 72400, orders: 24 },
        { label: 'Вс, 04 ноя', revenue: 51500, orders: 17 }
      ],
      categories: [
        { id: 'candles', name: 'Свечи из соевого воска', percentage: 58, revenue: 223010, units: 84, color: '#B8683D' },
        { id: 'diffusers', name: 'Диффузоры интерьерные', percentage: 24, revenue: 92280, units: 28, color: '#D9875A' },
        { id: 'sachets', name: 'Флорентийские саше', percentage: 12, revenue: 46140, units: 42, color: '#D97706' },
        { id: 'sets', name: 'Подарочные сеты', percentage: 6, revenue: 23070, units: 7, color: '#A39B92' }
      ]
    },
    month: {
      periodLabel: 'Текущий месяц',
      comparisonLabel: 'к предыдущему месяцу',
      kpi: {
        ...effectiveKpi,
        activeOrdersCount: realActiveOrdersCount
      },
      chartPoints: [
        { label: '01–05 окт', sublabel: 'Неделя 1', revenue: 210400, orders: 68 },
        { label: '06–10 окт', sublabel: 'Неделя 2', revenue: 248200, orders: 81 },
        { label: '11–15 окт', sublabel: 'Неделя 3', revenue: 295000, orders: 94 },
        { label: '16–20 окт', sublabel: 'Неделя 4', revenue: 284100, orders: 92 },
        { label: '21–25 окт', sublabel: 'Неделя 5', revenue: 312500, orders: 102 },
        { label: '26–31 окт', sublabel: 'Конец мес.', revenue: 335400, orders: 110 }
      ],
      categories: [
        { id: 'candles', name: 'Свечи из соевого воска', percentage: 58, revenue: Math.round(effectiveKpi.revenue * 0.58), units: 312, color: '#B8683D' },
        { id: 'diffusers', name: 'Диффузоры интерьерные', percentage: 24, revenue: Math.round(effectiveKpi.revenue * 0.24), units: 98, color: '#D9875A' },
        { id: 'sachets', name: 'Флорентийские саше', percentage: 12, revenue: Math.round(effectiveKpi.revenue * 0.12), units: 54, color: '#D97706' },
        { id: 'sets', name: 'Подарочные сеты', percentage: 6, revenue: Math.round(effectiveKpi.revenue * 0.06), units: 18, color: '#A39B92' }
      ]
    },
    quarter: {
      periodLabel: 'IV Квартал 2026',
      comparisonLabel: 'к III кварталу',
      kpi: {
        revenue: 4210000,
        revenueGrowthPercent: 31.4,
        netProfit: 2526000,
        ordersCount: 1360,
        averageCheck: 3095,
        activeOrdersCount: realActiveOrdersCount,
        conversionRate: 4.9
      },
      chartPoints: [
        { label: 'Август', revenue: 1180000, orders: 380 },
        { label: 'Сентябрь', revenue: 1340000, orders: 432 },
        { label: 'Октябрь', revenue: 1485600, orders: 482 },
        { label: 'Ноябрь (прогноз)', revenue: 1650000, orders: 530 }
      ],
      categories: [
        { id: 'candles', name: 'Свечи из соевого воска', percentage: 58, revenue: 2441800, units: 870, color: '#B8683D' },
        { id: 'diffusers', name: 'Диффузоры интерьерные', percentage: 24, revenue: 1010400, units: 290, color: '#D9875A' },
        { id: 'sachets', name: 'Флорентийские саше', percentage: 12, revenue: 505200, units: 154, color: '#D97706' },
        { id: 'sets', name: 'Подарочные сеты', percentage: 6, revenue: 252600, units: 46, color: '#A39B92' }
      ]
    }
  }), [effectiveKpi, realActiveOrdersCount]);

  const currentData = PERIOD_DATA[selectedPeriod];

  // Top-5 bestselling scents (derived and enriched from products)
  const topBestsellers = useMemo(() => [
    {
      rank: 1,
      title: effectiveProducts[0]?.title || 'Табак и Ваниль',
      subtitle: effectiveProducts[0]?.subtitle || 'Бурбонская ваниль, кубинский табак, пряный имбирь',
      category: 'Свечи 100/250 мл',
      unitsSold: selectedPeriod === 'today' ? 12 : selectedPeriod === 'yesterday' ? 15 : selectedPeriod === '7days' ? 64 : 184,
      revenue: selectedPeriod === 'today' ? 27800 : selectedPeriod === 'yesterday' ? 34200 : selectedPeriod === '7days' ? 142000 : 398400,
      rating: effectiveProducts[0]?.rating || 4.9,
      reviewsCount: effectiveProducts[0]?.reviewsCount || 38,
      share: 32,
      image: effectiveProducts[0]?.images[0] || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=200',
      badge: 'Бестселлер №1'
    },
    {
      rank: 2,
      title: effectiveProducts[1]?.title || 'Хвоя и Можжевельник',
      subtitle: effectiveProducts[1]?.subtitle || 'Иглы пихты, смола кедра, влажный мох',
      category: 'Свечи 100/250 мл',
      unitsSold: selectedPeriod === 'today' ? 8 : selectedPeriod === 'yesterday' ? 11 : selectedPeriod === '7days' ? 44 : 128,
      revenue: selectedPeriod === 'today' ? 18600 : selectedPeriod === 'yesterday' ? 24800 : selectedPeriod === '7days' ? 98400 : 274500,
      rating: effectiveProducts[1]?.rating || 4.8,
      reviewsCount: effectiveProducts[1]?.reviewsCount || 22,
      share: 24,
      image: effectiveProducts[1]?.images[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200',
      badge: 'Аромат Граса'
    },
    {
      rank: 3,
      title: effectiveProducts[2]?.title || 'Сандал и Кардамон',
      subtitle: effectiveProducts[2]?.subtitle || 'Майсурский сандал, амброксан, зеленый кардамон',
      category: 'Диффузоры 100/200 мл',
      unitsSold: selectedPeriod === 'today' ? 6 : selectedPeriod === 'yesterday' ? 8 : selectedPeriod === '7days' ? 32 : 92,
      revenue: selectedPeriod === 'today' ? 15800 : selectedPeriod === 'yesterday' ? 20400 : selectedPeriod === '7days' ? 84200 : 238600,
      rating: effectiveProducts[2]?.rating || 5.0,
      reviewsCount: effectiveProducts[2]?.reviewsCount || 16,
      share: 19,
      image: effectiveProducts[2]?.images[0] || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200',
      badge: 'Любимец клиентов'
    },
    {
      rank: 4,
      title: effectiveProducts[3]?.title || 'Инжир и Розовый Перец',
      subtitle: effectiveProducts[3]?.subtitle || 'Лист инжира, белый кедр, спелые ягоды',
      category: 'Восковые саше 45г',
      unitsSold: selectedPeriod === 'today' ? 14 : selectedPeriod === 'yesterday' ? 18 : selectedPeriod === '7days' ? 58 : 78,
      revenue: selectedPeriod === 'today' ? 11060 : selectedPeriod === 'yesterday' ? 14220 : selectedPeriod === '7days' ? 45820 : 61620,
      rating: effectiveProducts[3]?.rating || 4.9,
      reviewsCount: effectiveProducts[3]?.reviewsCount || 19,
      share: 14,
      image: effectiveProducts[3]?.images[0] || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200'
    },
    {
      rank: 5,
      title: 'Черная Смородина и Мята',
      subtitle: 'Лист смородины, дикая мята, белый мускус',
      category: 'Свечи 100/250 мл',
      unitsSold: selectedPeriod === 'today' ? 4 : selectedPeriod === 'yesterday' ? 6 : selectedPeriod === '7days' ? 22 : 64,
      revenue: selectedPeriod === 'today' ? 9200 : selectedPeriod === 'yesterday' ? 13400 : selectedPeriod === '7days' ? 48600 : 134200,
      rating: 4.7,
      reviewsCount: 14,
      share: 11,
      image: 'https://images.unsplash.com/photo-1572726729437-3732efed37c1?auto=format&fit=crop&q=80&w=200'
    }
  ], [selectedPeriod, effectiveProducts]);

  // Format currency
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(val)) + ' ₽';
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(val);
  };

  // SVG Chart geometry calculation
  const chartPoints = currentData.chartPoints;
  const maxRevenue = Math.max(...chartPoints.map(p => p.revenue)) * 1.15;
  const minRevenue = 0;
  const chartHeight = 220;
  const chartWidth = 760;
  const paddingX = 40;
  const paddingY = 30;

  const points = chartPoints.map((pt, idx) => {
    const x = paddingX + (idx / Math.max(1, chartPoints.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((pt.revenue - minRevenue) / (maxRevenue - minRevenue || 1)) * (chartHeight - paddingY * 2);
    return { ...pt, x, y };
  });

  // Construct smooth SVG Bezier path
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Closed area path for gradient
  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = chartHeight - paddingY;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points]);

  // Quick Action: Export CSV
  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const headers = ['Аромат', 'Категория', 'Продано шт.', 'Выручка (руб.)', 'Рейтинг'];
        const rows = topBestsellers.map(b => [
          `"${b.title}"`,
          `"${b.category}"`,
          b.unitsSold,
          b.revenue,
          b.rating
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `candela-analytics-${selectedPeriod}-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Отчёт успешно выгружен в формате CSV');
      } catch (err) {
        showToast('Экспорт завершён');
      } finally {
        setIsExporting(false);
      }
    }, 600);
  };

  // Quick Action: Generate Executive Summary Report
  const handleGenerateReport = () => {
    showToast('Сформирован сводный аналитический отчёт за ' + currentData.periodLabel);
  };

  const hoveredPoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : null;

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1C1917] text-white px-4 py-3 rounded-xl shadow-2xl border border-stone-700 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================== SCREEN TOP BAR ===================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-cormorant text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              Сводная аналитика
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live CRM
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Операционные показатели ателье ароматов Candela Home
          </p>
        </div>

        {/* Action Controls & Period Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Period Selector Tabs */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs font-medium">
            {(
              [
                { id: 'today', label: 'Сегодня' },
                { id: 'yesterday', label: 'Вчера' },
                { id: '7days', label: '7 дней' },
                { id: 'month', label: 'Месяц' },
                { id: 'quarter', label: 'Квартал' }
              ] as const
            ).map(tab => {
              const isSelected = selectedPeriod === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPeriod(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#B8683D] text-white shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Action: Generate Report */}
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-800 hover:border-[#B8683D]/50 hover:bg-[#B8683D]/5 transition-all shadow-xs"
            title="Сформировать отчёт"
          >
            <FileText className="w-4 h-4 text-[#B8683D]" />
            <span className="hidden sm:inline">Сформировать отчёт</span>
          </button>

          {/* Quick Action: Export CSV */}
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#B8683D] hover:bg-[#A0552D] text-white transition-all shadow-xs shadow-[#B8683D]/25 disabled:opacity-60"
            title="Экспорт данных"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Экспорт данных</span>
          </button>
        </div>
      </div>

      {/* ===================== 4 KPI METRIC CARDS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Выручка */}
        <div className="bg-white dark:bg-[#1C1917] p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(32,29,27,0.04)] relative overflow-hidden group hover:border-[#B8683D]/40 transition-all duration-200">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Выручка ателье
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#B8683D]/10 text-[#B8683D] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif font-cormorant text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              {formatMoney(currentData.kpi.revenue)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-stone-100 dark:border-stone-800/80">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{currentData.kpi.revenueGrowthPercent}%</span>
            </div>
            <span className="text-stone-400 dark:text-stone-500 text-[11px]">
              {currentData.comparisonLabel}
            </span>
          </div>
        </div>

        {/* KPI 2: Чистая прибыль */}
        <div className="bg-white dark:bg-[#1C1917] p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(32,29,27,0.04)] relative overflow-hidden group hover:border-[#B8683D]/40 transition-all duration-200">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Чистая прибыль
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif font-cormorant text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              {formatMoney(currentData.kpi.netProfit)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-stone-100 dark:border-stone-800/80">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              Маржинальность 60.0%
            </span>
            <span className="text-stone-400 dark:text-stone-500 text-[11px]">
              После расходов
            </span>
          </div>
        </div>

        {/* KPI 3: Заказов (шт.) + AOV средний чек */}
        <div className="bg-white dark:bg-[#1C1917] p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(32,29,27,0.04)] relative overflow-hidden group hover:border-[#B8683D]/40 transition-all duration-200">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Заказы & AOV
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="font-serif font-cormorant text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                {currentData.kpi.ordersCount}
              </span>
              <span className="text-xs text-stone-400 ml-1">шт.</span>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                Ср. чек
              </div>
              <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {formatMoney(currentData.kpi.averageCheck)}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-stone-100 dark:border-stone-800/80">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8.4% AOV</span>
            </div>
            <span className="text-stone-400 dark:text-stone-500 text-[11px]">
              Конверсия: {currentData.kpi.conversionRate}%
            </span>
          </div>
        </div>

        {/* KPI 4: Активные заказы (требующие сборки) */}
        <div
          onClick={handleNavigateToOrders}
          className="bg-white dark:bg-[#1C1917] p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(32,29,27,0.04)] relative overflow-hidden group hover:border-[#B8683D] cursor-pointer transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              К сборке и отправке
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-bounce">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif font-cormorant text-3xl sm:text-4xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {currentData.kpi.activeOrdersCount}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              заказов в очереди
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-stone-100 dark:border-stone-800/80 text-stone-600 dark:text-stone-300 font-medium group-hover:text-[#B8683D]">
            <span>Требуют сборки и трек-номеров</span>
            <div className="flex items-center gap-1 font-semibold text-[#B8683D]">
              <span>Перейти</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== SALES CHART & REVENUE DYNAMICS ===================== */}
      <div className="bg-white dark:bg-[#1C1917] p-5 sm:p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(32,29,27,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif font-cormorant text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Динамика выручки ({currentData.periodLabel})
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Почасовые и посуточные срезы поступлений со всех каналов (ЮKassa / СБП / T-Pay)
            </p>
          </div>

          {/* Hovered point value readout */}
          {hoveredPoint ? (
            <div className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 flex items-center gap-3 text-xs">
              <span className="text-stone-500 font-medium">{hoveredPoint.label}:</span>
              <span className="font-bold text-[#B8683D]">{formatMoney(hoveredPoint.revenue)}</span>
              <span className="text-stone-400">({hoveredPoint.orders} зак.)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B8683D]" />
              <span>Наведите на точку графика для детализации</span>
            </div>
          )}
        </div>

        {/* Clean Interactive SVG Chart */}
        <div className="relative w-full overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-56 sm:h-64 overflow-visible"
          >
            <defs>
              <linearGradient id="terracottaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B8683D" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#B8683D" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#B8683D" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
              const val = minRevenue + ratio * (maxRevenue - minRevenue);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-stone-200 dark:text-stone-800"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-stone-400 dark:fill-stone-600 font-sans"
                  >
                    {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${Math.round(val / 1000)}k` : '0'}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area under curve */}
            <path d={areaD} fill="url(#terracottaGradient)" />

            {/* Line stroke */}
            <path
              d={pathD}
              fill="none"
              stroke="#B8683D"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data points */}
            {points.map((pt, idx) => {
              const isHovered = hoveredPointIndex === idx;
              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible hit target for smooth hover */}
                  <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                  {/* Outer glow ring on hover */}
                  {isHovered && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="9"
                      fill="#B8683D"
                      fillOpacity="0.2"
                      className="animate-ping"
                    />
                  )}

                  {/* Point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? '#B8683D' : '#FFFFFF'}
                    stroke="#B8683D"
                    strokeWidth={isHovered ? 3 : 2.5}
                    className="transition-all duration-150"
                  />

                  {/* X Axis label below */}
                  <text
                    x={pt.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className={`text-[10px] font-sans transition-colors ${
                      isHovered
                        ? 'fill-[#B8683D] font-bold'
                        : 'fill-stone-400 dark:fill-stone-500'
                    }`}
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Chart Footer Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Пиковый чек</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">5 570 ₽ (CH-1047)</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Повторные клиенты</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">42% (LTV 7 890 ₽)</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Эквайринг комиссия</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">1.4% (ЮKassa СБП)</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Доставка без сбоев</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">98.8% в срок</span>
          </div>
        </div>
      </div>

      {/* ===================== CATEGORY SHARE & BESTSELLERS GRID ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Share Breakdown (1 Column) */}
        <div className="bg-white dark:bg-[#1C1917] p-5 sm:p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(32,29,27,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="font-serif font-cormorant text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                  Доля категорий
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Структура ассортимента и выручки
                </p>
              </div>
              <button
                onClick={handleNavigateToCatalog}
                className="text-xs font-semibold text-[#B8683D] hover:underline flex items-center gap-1"
              >
                Каталог <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Segmented Progress Bar */}
            <div className="mt-5 mb-6">
              <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 flex overflow-hidden p-0.5 gap-0.5">
                {currentData.categories.map(cat => (
                  <div
                    key={cat.id}
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-90 cursor-pointer"
                    title={`${cat.name}: ${cat.percentage}%`}
                  />
                ))}
              </div>
            </div>

            {/* Category Rows */}
            <div className="space-y-4">
              {currentData.categories.map(cat => (
                <div key={cat.id} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
                      <span>{cat.percentage}%</span>
                      <span className="text-stone-400 font-normal text-[11px]">
                        ({formatMoney(cat.revenue)})
                      </span>
                    </div>
                  </div>

                  {/* Individual thin bar */}
                  <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-stone-800/80 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/60 dark:bg-stone-900/40 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Маржинальный лидер:</span>
              <span className="font-semibold text-[#B8683D]">Свечи 250 мл (маржа 69%)</span>
            </div>
          </div>
        </div>

        {/* Top-5 Bestselling Scents (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C1917] p-5 sm:p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(32,29,27,0.04)]">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-serif font-cormorant text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                Топ-5 бестселлеров по ароматам
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Флагманские композиции с наивысшим спросом и оценками
              </p>
            </div>
            <button
              onClick={handleNavigateToCatalog}
              className="text-xs font-semibold text-[#B8683D] hover:underline flex items-center gap-1"
            >
              Все товары <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table container */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 dark:border-stone-800 text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                  <th className="py-2.5 px-2">№</th>
                  <th className="py-2.5 px-2">Аромат</th>
                  <th className="py-2.5 px-2 text-right">Продано</th>
                  <th className="py-2.5 px-2 text-right">Выручка</th>
                  <th className="py-2.5 px-2 text-center">Рейтинг</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {topBestsellers.map(scent => (
                  <tr
                    key={scent.rank}
                    className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3 px-2 font-bold">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] ${
                          scent.rank === 1
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold ring-1 ring-amber-500/30'
                            : scent.rank === 2
                            ? 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold'
                            : scent.rank === 3
                            ? 'bg-[#B8683D]/15 text-[#B8683D] dark:text-[#D9875A] font-bold'
                            : 'text-stone-400'
                        }`}
                      >
                        {scent.rank}
                      </span>
                    </td>

                    {/* Scent Title + Image */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={scent.image}
                          alt={scent.title}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200/80 dark:border-stone-700/80 shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#B8683D] transition-colors">
                              {scent.title}
                            </span>
                            {scent.badge && (
                              <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded-full font-medium bg-[#B8683D]/10 text-[#B8683D]">
                                {scent.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-400 block truncate max-w-xs">
                            {scent.subtitle}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Units Sold */}
                    <td className="py-3 px-2 text-right font-medium text-stone-800 dark:text-stone-200">
                      <span>{formatNumber(scent.unitsSold)} шт.</span>
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-2 text-right font-bold text-stone-900 dark:text-stone-100">
                      <span>{formatMoney(scent.revenue)}</span>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-2 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-semibold text-[11px]">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{scent.rating}</span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          ({scent.reviewsCount})
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
