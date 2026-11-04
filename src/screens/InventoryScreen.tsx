import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Search,
  Filter,
  History,
  CheckCircle2,
  Package,
  Layers,
  Coins,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  X,
  FileSpreadsheet,
  Clock,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Truck
} from 'lucide-react';
import { Product, ProductVariant, UserRole } from '../types/crm';
import { INITIAL_PRODUCTS } from '../data/mockData';

export interface InventoryScreenProps {
  products?: Product[];
  onUpdateStock?: (
    productId: string,
    variantId: string,
    deltaOrValue: number,
    isAbsolute?: boolean
  ) => void;
  currentRole?: UserRole;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'adjustment';
  productTitle: string;
  variantVolume: string;
  quantityDelta: number;
  reason: string;
  sourceDoc?: string;
  performedBy: string;
}

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    timestamp: '05.11.2026, 00:48',
    type: 'outgoing',
    productTitle: 'Табак и Ваниль',
    variantVolume: '250 мл',
    quantityDelta: -1,
    reason: 'Автосписание по оплаченному заказу',
    sourceDoc: 'Заказ #CH-1048',
    performedBy: 'Система (ЮKassa)'
  },
  {
    id: 'mov-2',
    timestamp: '05.11.2026, 00:48',
    type: 'outgoing',
    productTitle: 'Инжир и Розовый Перец',
    variantVolume: '1 шт (45г)',
    quantityDelta: -2,
    reason: 'Автосписание по оплаченному заказу',
    sourceDoc: 'Заказ #CH-1048',
    performedBy: 'Система (ЮKassa)'
  },
  {
    id: 'mov-3',
    timestamp: '04.11.2026, 22:30',
    type: 'outgoing',
    productTitle: 'Хвоя и Можжевельник',
    variantVolume: '250 мл',
    quantityDelta: -2,
    reason: 'Резерв сборки заказа',
    sourceDoc: 'Заказ #CH-1047',
    performedBy: 'Иван (Склад)'
  },
  {
    id: 'mov-4',
    timestamp: '04.11.2026, 17:15',
    type: 'incoming',
    productTitle: 'Табак и Ваниль',
    variantVolume: '100 мл',
    quantityDelta: 15,
    reason: 'Поступление готовой партии из мастерской',
    sourceDoc: 'Партия #CW-2026-44',
    performedBy: 'Александр (Основатель)'
  },
  {
    id: 'mov-5',
    timestamp: '04.11.2026, 16:50',
    type: 'incoming',
    productTitle: 'Хвоя и Можжевельник',
    variantVolume: '100 мл',
    quantityDelta: 12,
    reason: 'Оприходование партии свечей с соевым воском',
    sourceDoc: 'Партия #CW-2026-43',
    performedBy: 'Марина (Управляющая)'
  },
  {
    id: 'mov-6',
    timestamp: '03.11.2026, 14:10',
    type: 'adjustment',
    productTitle: 'Сандал и Кардамон',
    variantVolume: '200 мл',
    quantityDelta: -1,
    reason: 'Списание образца для парфюмерного шоурума',
    sourceDoc: 'Акт списания #АКТ-12',
    performedBy: 'Полина (Контент)'
  }
];

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  products: initialProductsProp,
  onUpdateStock,
  currentRole = 'OWNER'
}) => {
  const [products, setProducts] = useState<Product[]>(initialProductsProp || INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);

  // Sync with prop
  useEffect(() => {
    if (initialProductsProp) {
      setProducts(initialProductsProp);
    }
  }, [initialProductsProp]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'normal' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc' | 'value_desc'>('stock_asc');

  // Modals
  const [isReplenishModalOpen, setIsReplenishModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedItemForReplenish, setSelectedItemForReplenish] = useState<{
    productId: string;
    variantId: string;
    productTitle: string;
    volume: string;
    currentStock: number;
    costPrice: number;
  } | null>(null);

  // Replenishment Form State
  const [replenishData, setReplenishData] = useState({
    productId: '',
    variantId: '',
    quantity: 10,
    costPrice: 500,
    reason: 'Поступление готовой партии из мастерской',
    sourceDoc: 'ТТН-2026-',
    note: ''
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const canEditStock = currentRole === 'OWNER' || currentRole === 'ADMIN' || currentRole === 'MANAGER';

  // Flatten products and variants into SKU list
  interface FlattenedSKU {
    productId: string;
    variantId: string;
    title: string;
    category: string;
    image: string;
    volume: string;
    burnTime: string;
    stock: number;
    costPrice: number;
    sellingPrice: number;
    totalCostValue: number;
    totalRetailValue: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
  }

  const flattenedSKUs = useMemo<FlattenedSKU[]>(() => {
    const list: FlattenedSKU[] = [];
    products.forEach((p) => {
      p.variants.forEach((v) => {
        list.push({
          productId: p.id,
          variantId: v.id,
          title: p.title,
          category: p.category,
          image: p.images[0] || '',
          volume: v.volume,
          burnTime: v.burnTime,
          stock: v.stock,
          costPrice: v.costPrice || Math.round(v.finalPrice * 0.3),
          sellingPrice: v.finalPrice,
          totalCostValue: v.stock * (v.costPrice || Math.round(v.finalPrice * 0.3)),
          totalRetailValue: v.stock * v.finalPrice,
          isLowStock: v.stock > 0 && v.stock < 5,
          isOutOfStock: v.stock === 0
        });
      });
    });
    return list;
  }, [products]);

  // Overall Statistics
  const totalSKUs = flattenedSKUs.length;
  const lowStockCount = flattenedSKUs.filter((s) => s.isLowStock).length;
  const outOfStockCount = flattenedSKUs.filter((s) => s.isOutOfStock).length;
  const totalUnitsInStock = flattenedSKUs.reduce((sum, s) => sum + s.stock, 0);
  const totalCostValue = flattenedSKUs.reduce((sum, s) => sum + s.totalCostValue, 0);
  const totalRetailValue = flattenedSKUs.reduce((sum, s) => sum + s.totalRetailValue, 0);

  // Filtered & Sorted SKUs
  const filteredSKUs = useMemo(() => {
    return flattenedSKUs
      .filter((sku) => {
        // Category
        if (selectedCategory !== 'all' && sku.category !== selectedCategory) {
          return false;
        }
        // Stock Status
        if (statusFilter === 'low' && !sku.isLowStock) return false;
        if (statusFilter === 'normal' && (sku.isLowStock || sku.isOutOfStock)) return false;
        if (statusFilter === 'out' && !sku.isOutOfStock) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = sku.title.toLowerCase().includes(q);
          const matchVol = sku.volume.toLowerCase().includes(q);
          return matchTitle || matchVol;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        if (sortBy === 'stock_asc') return a.stock - b.stock;
        if (sortBy === 'stock_desc') return b.stock - a.stock;
        if (sortBy === 'value_desc') return b.totalCostValue - a.totalCostValue;
        return 0;
      });
  }, [flattenedSKUs, selectedCategory, statusFilter, searchQuery, sortBy]);

  // Handle direct stock adjustment
  const handleStockChange = (
    productId: string,
    variantId: string,
    deltaOrValue: number,
    isAbsolute = false
  ) => {
    if (!canEditStock) {
      alert('У вашей роли нет прав на редактирование складских остатков');
      return;
    }

    if (onUpdateStock) {
      onUpdateStock(productId, variantId, deltaOrValue, isAbsolute);
    } else {
      // Local state fallback
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              variants: p.variants.map((v) => {
                if (v.id === variantId) {
                  const newStock = isAbsolute
                    ? Math.max(0, deltaOrValue)
                    : Math.max(0, v.stock + deltaOrValue);
                  return { ...v, stock: newStock };
                }
                return v;
              })
            };
          }
          return p;
        })
      );
    }

    // Also add to movement log
    const targetSKU = flattenedSKUs.find(
      (s) => s.productId === productId && s.variantId === variantId
    );
    if (targetSKU) {
      const delta = isAbsolute ? deltaOrValue - targetSKU.stock : deltaOrValue;
      if (delta !== 0) {
        const newMov: StockMovement = {
          id: `mov-${Date.now()}`,
          timestamp: new Date().toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          type: delta > 0 ? 'incoming' : 'outgoing',
          productTitle: targetSKU.title,
          variantVolume: targetSKU.volume,
          quantityDelta: delta,
          reason: delta > 0 ? 'Ручное пополнение остатка' : 'Ручное списание остатка',
          sourceDoc: 'Интерфейс CRM',
          performedBy: currentRole === 'OWNER' ? 'Владелец' : currentRole === 'ADMIN' ? 'Управляющий' : 'Склад'
        };
        setMovements((prev) => [newMov, ...prev]);
        showToast(`Остаток ${targetSKU.title} (${targetSKU.volume}) изменен на ${delta > 0 ? `+${delta}` : delta} шт.`);
      }
    }
  };

  // Open Replenishment Modal
  const handleOpenReplenishModal = (sku?: FlattenedSKU) => {
    if (sku) {
      setSelectedItemForReplenish({
        productId: sku.productId,
        variantId: sku.variantId,
        productTitle: sku.title,
        volume: sku.volume,
        currentStock: sku.stock,
        costPrice: sku.costPrice
      });
      setReplenishData({
        productId: sku.productId,
        variantId: sku.variantId,
        quantity: 15,
        costPrice: sku.costPrice,
        reason: 'Поступление готовой партии из мастерской',
        sourceDoc: `Партия #CW-${Math.floor(1000 + Math.random() * 9000)}`,
        note: ''
      });
    } else {
      const firstSKU = flattenedSKUs[0];
      setSelectedItemForReplenish(null);
      setReplenishData({
        productId: firstSKU?.productId || '',
        variantId: firstSKU?.variantId || '',
        quantity: 20,
        costPrice: firstSKU?.costPrice || 500,
        reason: 'Поставка партии соевого воска и компонентов',
        sourceDoc: `ТТН-${Math.floor(10000 + Math.random() * 90000)}`,
        note: ''
      });
    }
    setIsReplenishModalOpen(true);
  };

  // Submit Replenishment
  const handleSubmitReplenish = (e: React.FormEvent) => {
    e.preventDefault();
    if (replenishData.quantity <= 0) {
      alert('Количество должно быть больше нуля');
      return;
    }

    const targetSKU = flattenedSKUs.find(
      (s) => s.productId === replenishData.productId && s.variantId === replenishData.variantId
    );

    if (!targetSKU) {
      alert('Позиция не найдена');
      return;
    }

    handleStockChange(replenishData.productId, replenishData.variantId, replenishData.quantity, false);

    // Add movement
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'incoming',
      productTitle: targetSKU.title,
      variantVolume: targetSKU.volume,
      quantityDelta: replenishData.quantity,
      reason: replenishData.reason,
      sourceDoc: replenishData.sourceDoc,
      performedBy: currentRole === 'OWNER' ? 'Владелец' : currentRole === 'ADMIN' ? 'Управляющий' : 'Склад'
    };

    setMovements((prev) => [newMovement, ...prev]);
    setIsReplenishModalOpen(false);
    showToast(`Оприходовано +${replenishData.quantity} шт. ${targetSKU.title} (${targetSKU.volume})`);
  };

  // Export report simulated
  const handleExportStockReport = () => {
    const csvContent = [
      'Артикул;Товар;Объем;Остаток;Себестоимость;Розница;Сумма себестоимости',
      ...flattenedSKUs.map(
        (s) =>
          `${s.variantId};${s.title};${s.volume};${s.stock};${s.costPrice};${s.sellingPrice};${s.totalCostValue}`
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `candela-stock-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ведомость остатков успешно экспортирована в CSV');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-stone-900 text-stone-100 shadow-2xl border border-stone-700/50 backdrop-blur-md animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E8E2D9] dark:border-[#2E2A27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#B8683D] font-semibold">Candela Home Logistics</span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">Складской учет и партии</span>
          </div>
          <h1 className="font-serif font-cormorant text-3xl md:text-4xl font-normal text-stone-900 dark:text-stone-100 tracking-wide mt-1">
            Складские остатки
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Матрица товарных позиций, оперативное управление запасами свечей и сырья, предупреждения о критических остатках.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* History Button */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-stone-700 dark:text-stone-300 font-medium text-sm hover:bg-[#F4EFEA] dark:hover:bg-[#24201D] transition-colors"
          >
            <History className="w-4 h-4 text-stone-400" />
            <span>Журнал операций ({movements.length})</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportStockReport}
            title="Экспорт ведомости остатков в Excel/CSV"
            className="p-2.5 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          {/* Replenish Button */}
          <button
            onClick={() => handleOpenReplenishModal()}
            disabled={!canEditStock}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md active:scale-95 ${
              canEditStock
                ? 'bg-[#B8683D] hover:bg-[#A0552D] text-white hover:shadow-lg'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Оприходовать поставку</span>
          </button>
        </div>
      </div>

      {/* KPI & Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-medium">Всего SKU</span>
            <Boxes className="w-4 h-4 text-[#B8683D]" />
          </div>
          <div className="mt-2">
            <span className="font-serif font-cormorant text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {totalSKUs}
            </span>
            <span className="text-xs text-stone-400 ml-2">вариантов</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            Всего на складе: <span className="font-semibold text-stone-700 dark:text-stone-300">{totalUnitsInStock} шт.</span>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div
          onClick={() => setStatusFilter(lowStockCount > 0 ? 'low' : 'all')}
          className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${
            lowStockCount > 0
              ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 hover:border-amber-500'
              : 'bg-white dark:bg-[#1C1917] border-[#E8E2D9] dark:border-[#2E2A27]'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold ${lowStockCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500'}`}>
              Критический остаток (&lt; 5 шт.)
            </span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-600 animate-pulse' : 'text-stone-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-serif font-cormorant text-2xl md:text-3xl font-bold ${
              lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'
            }`}>
              {lowStockCount}
            </span>
            <span className="text-xs text-stone-500">позиций</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            {lowStockCount > 0 ? (
              <span className="text-amber-700 dark:text-amber-400 font-medium">Требуют дозаказа партии!</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Все запасы в норме</span>
            )}
          </div>
        </div>

        {/* Total Cost Value */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-medium">Себестоимость склада</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="font-serif font-cormorant text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {totalCostValue.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            Вложенный капитал в сырье и баночки
          </div>
        </div>

        {/* Total Retail Potential */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span className="font-medium">Потенциал выручки</span>
            <TrendingUp className="w-4 h-4 text-[#B8683D]" />
          </div>
          <div className="mt-2">
            <span className="font-serif font-cormorant text-2xl md:text-3xl font-bold text-[#B8683D]">
              {totalRetailValue.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            Маржинальность остатка: ~{Math.round(((totalRetailValue - totalCostValue) / (totalRetailValue || 1)) * 100)}%
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status quick filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#B8683D] text-white shadow-sm'
                : 'bg-white dark:bg-[#1C1917] text-stone-600 dark:text-stone-300 border border-[#E8E2D9] dark:border-[#2E2A27]'
            }`}
          >
            Все остатки ({totalSKUs})
          </button>
          <button
            onClick={() => setStatusFilter('low')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'low'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#1C1917] text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Критический остаток ({lowStockCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('normal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'normal'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#1C1917] text-stone-600 dark:text-stone-300 border border-[#E8E2D9] dark:border-[#2E2A27]'
            }`}
          >
            В норме (&ge; 5)
          </button>
          <button
            onClick={() => setStatusFilter('out')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'out'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#1C1917] text-stone-600 dark:text-stone-300 border border-[#E8E2D9] dark:border-[#2E2A27]'
            }`}
          >
            Закончились ({outOfStockCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по аромату или объему..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-xs text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
          >
            <option value="all">Все категории</option>
            <option value="candles">Свечи</option>
            <option value="diffusers">Диффузоры</option>
            <option value="sachets">Саше</option>
            <option value="sets">Наборы</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-xs text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
          >
            <option value="stock_asc">Сначала меньший остаток</option>
            <option value="stock_desc">Сначала больший остаток</option>
            <option value="name">По алфавиту (А-Я)</option>
            <option value="value_desc">По общей стоимости</option>
          </select>
        </div>
      </div>

      {/* Stock Matrix Table */}
      <div className="bg-white dark:bg-[#1C1917] rounded-3xl border border-[#E8E2D9] dark:border-[#2E2A27] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EFEA] dark:bg-[#24201D] text-stone-500 uppercase tracking-wider font-semibold border-b border-[#E8E2D9] dark:border-[#2E2A27]">
              <tr>
                <th className="py-3 px-4">Товар / Аромат</th>
                <th className="py-3 px-3">Категория</th>
                <th className="py-3 px-3">Объем</th>
                <th className="py-3 px-3">Текущий остаток</th>
                <th className="py-3 px-3">Статус порога</th>
                <th className="py-3 px-3">Себестоимость</th>
                <th className="py-3 px-3">Розница</th>
                <th className="py-3 px-3">Сумма себестоимости</th>
                <th className="py-3 px-4 text-center">Оперативная корректировка</th>
                <th className="py-3 px-3 text-right">Пополнение</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9] dark:divide-[#2E2A27]">
              {filteredSKUs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    Позиций, соответствующих критериям фильтра, не найдено
                  </td>
                </tr>
              ) : (
                filteredSKUs.map((sku) => {
                  return (
                    <tr
                      key={`${sku.productId}-${sku.variantId}`}
                      className={`transition-colors ${
                        sku.isLowStock
                          ? 'bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-l-amber-500'
                          : sku.isOutOfStock
                          ? 'bg-rose-500/5 dark:bg-rose-500/10 border-l-4 border-l-rose-500'
                          : 'hover:bg-[#FBF9F5] dark:hover:bg-[#24201D]/50'
                      }`}
                    >
                      {/* Product Name & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={sku.image}
                            alt={sku.title}
                            className="w-10 h-10 rounded-xl object-cover border border-[#E8E2D9] dark:border-[#2E2A27] shrink-0"
                          />
                          <div>
                            <div className="font-serif font-cormorant text-base font-bold text-stone-900 dark:text-stone-100">
                              {sku.title}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              {sku.burnTime}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F4EFEA] dark:bg-[#24201D] text-stone-600 dark:text-stone-400">
                          {sku.category === 'candles'
                            ? 'Свечи'
                            : sku.category === 'diffusers'
                            ? 'Диффузоры'
                            : sku.category === 'sachets'
                            ? 'Саше'
                            : 'Наборы'}
                        </span>
                      </td>

                      {/* Volume Variant */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-medium text-stone-800 dark:text-stone-200">
                        {sku.volume}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-serif font-cormorant text-lg font-bold ${
                              sku.isOutOfStock
                                ? 'text-rose-600'
                                : sku.isLowStock
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-stone-900 dark:text-stone-100'
                            }`}
                          >
                            {sku.stock} шт.
                          </span>
                        </div>
                      </td>

                      {/* Status / Alert */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {sku.isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                            <AlertCircle className="w-3 h-3" />
                            <span>Закончился</span>
                          </span>
                        ) : sku.isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Критический остаток (&lt; 5)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>В норме</span>
                          </span>
                        )}
                      </td>

                      {/* Cost Price */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-stone-600 dark:text-stone-400">
                        {sku.costPrice.toLocaleString('ru-RU')} ₽
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-medium text-stone-800 dark:text-stone-200">
                        {sku.sellingPrice.toLocaleString('ru-RU')} ₽
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-serif font-cormorant text-sm font-semibold text-[#B8683D]">
                        {sku.totalCostValue.toLocaleString('ru-RU')} ₽
                      </td>

                      {/* Inline Stock Editor (+ / - / input) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#F4EFEA] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27]">
                          <button
                            type="button"
                            onClick={() => handleStockChange(sku.productId, sku.variantId, -1, false)}
                            disabled={!canEditStock || sku.stock <= 0}
                            className="w-6 h-6 rounded-lg bg-white dark:bg-[#1C1917] text-stone-700 dark:text-stone-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                            title="Списать 1 шт."
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min={0}
                            value={sku.stock}
                            disabled={!canEditStock}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) {
                                handleStockChange(sku.productId, sku.variantId, val, true);
                              }
                            }}
                            className="w-12 text-center py-0.5 rounded bg-transparent font-serif font-cormorant text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:bg-white dark:focus:bg-[#1C1917]"
                          />

                          <button
                            type="button"
                            onClick={() => handleStockChange(sku.productId, sku.variantId, 1, false)}
                            disabled={!canEditStock}
                            className="w-6 h-6 rounded-lg bg-white dark:bg-[#1C1917] text-stone-700 dark:text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-center transition-colors disabled:opacity-30 shadow-xs"
                            title="Добавить 1 шт."
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Quick Replenish Button */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStockChange(sku.productId, sku.variantId, 10, false)}
                            disabled={!canEditStock}
                            className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[11px] font-semibold text-stone-700 dark:text-stone-300 transition-colors"
                            title="Быстро добавить +10 шт."
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenReplenishModal(sku)}
                            disabled={!canEditStock}
                            className="p-1.5 rounded-lg bg-[#B8683D]/10 hover:bg-[#B8683D]/20 text-[#B8683D] transition-colors"
                            title="Открыть форму оприходования партии"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPLENISHMENT MODAL («Оприходовать поставку») */}
      {isReplenishModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#1C1917] rounded-3xl border border-[#E8E2D9] dark:border-[#2E2A27] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#E8E2D9] dark:border-[#2E2A27] flex items-center justify-between bg-[#FBF9F5] dark:bg-[#24201D]/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B8683D]/10 text-[#B8683D] flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-cormorant text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Оприходование поставки
                  </h2>
                  <p className="text-xs text-stone-500">
                    Приемка партии продукции мастерской или сырья на склад
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReplenishModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-[#F4EFEA] dark:hover:bg-[#24201D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReplenish} className="p-6 space-y-4">
              {/* Target SKU select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Товарная позиция (SKU) *
                </label>
                <select
                  required
                  value={`${replenishData.productId}:::${replenishData.variantId}`}
                  onChange={(e) => {
                    const [pId, vId] = e.target.value.split(':::');
                    const found = flattenedSKUs.find(
                      (s) => s.productId === pId && s.variantId === vId
                    );
                    setReplenishData((prev) => ({
                      ...prev,
                      productId: pId,
                      variantId: vId,
                      costPrice: found ? found.costPrice : prev.costPrice
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                >
                  {flattenedSKUs.map((sku) => (
                    <option
                      key={`${sku.productId}:::${sku.variantId}`}
                      value={`${sku.productId}:::${sku.variantId}`}
                    >
                      {sku.title} — {sku.volume} (Текущий остаток: {sku.stock} шт.)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity to add */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Количество к оприходованию *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      value={replenishData.quantity}
                      onChange={(e) =>
                        setReplenishData((prev) => ({
                          ...prev,
                          quantity: Math.max(1, parseInt(e.target.value, 10) || 1)
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm font-bold text-[#B8683D] focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                      шт.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Себестоимость ед. (₽)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={replenishData.costPrice}
                    onChange={(e) =>
                      setReplenishData((prev) => ({
                        ...prev,
                        costPrice: Number(e.target.value)
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                  />
                </div>
              </div>

              {/* Reason / Source */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Причина / Источник партии
                </label>
                <select
                  value={replenishData.reason}
                  onChange={(e) =>
                    setReplenishData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                >
                  <option value="Поступление готовой партии из мастерской">
                    Поступление готовой партии из мастерской
                  </option>
                  <option value="Поставка соевого воска Golden Wax (США)">
                    Поставка соевого воска Golden Wax (США)
                  </option>
                  <option value="Поставка ароматических масел (Грасс, Франция)">
                    Поставка ароматических масел (Грасс, Франция)
                  </option>
                  <option value="Поставка стеклянной тары и крышек">
                    Поставка стеклянной тары и крышек
                  </option>
                  <option value="Возврат покупателя">Возврат покупателя</option>
                  <option value="Корректировка инвентаризации">Корректировка инвентаризации</option>
                </select>
              </div>

              {/* Waybill / Doc number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                  Номер накладной / ТТН
                </label>
                <input
                  type="text"
                  placeholder="ТТН-10492"
                  value={replenishData.sourceDoc}
                  onChange={(e) =>
                    setReplenishData((prev) => ({ ...prev, sourceDoc: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-[#E8E2D9] dark:border-[#2E2A27] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReplenishModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#B8683D] hover:bg-[#A0552D] text-white text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                >
                  Оприходовать на склад
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK MOVEMENT HISTORY MODAL */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#1C1917] rounded-3xl border border-[#E8E2D9] dark:border-[#2E2A27] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E8E2D9] dark:border-[#2E2A27] flex items-center justify-between bg-[#FBF9F5] dark:bg-[#24201D]/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B8683D]/10 text-[#B8683D] flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-cormorant text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Журнал движений склада
                  </h2>
                  <p className="text-xs text-stone-500">
                    Хронология списаний заказов, поставок сырья и ручных инвентаризаций
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-[#F4EFEA] dark:hover:bg-[#24201D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-[#E8E2D9] dark:divide-[#2E2A27]">
              {movements.map((mov) => {
                const isIncoming = mov.type === 'incoming';
                const isOutgoing = mov.type === 'outgoing';

                return (
                  <div key={mov.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isIncoming
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : isOutgoing
                            ? 'bg-rose-500/15 text-rose-600'
                            : 'bg-amber-500/15 text-amber-600'
                        }`}
                      >
                        {isIncoming ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : isOutgoing ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-cormorant text-base font-bold text-stone-900 dark:text-stone-100">
                            {mov.productTitle}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-[#F4EFEA] dark:bg-[#24201D] text-stone-600 dark:text-stone-400 font-medium">
                            {mov.variantVolume}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {mov.reason} {mov.sourceDoc && `(${mov.sourceDoc})`}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                          <Clock className="w-3 h-3" />
                          <span>{mov.timestamp}</span>
                          <span>•</span>
                          <span>{mov.performedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-serif font-cormorant text-lg font-bold ${
                          mov.quantityDelta > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta} шт.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E8E2D9] dark:border-[#2E2A27] bg-[#FBF9F5] dark:bg-[#24201D]/70 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Всего записей в аудит-логе: {movements.length}
              </span>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-stone-800 text-white text-xs font-semibold hover:bg-stone-900"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
