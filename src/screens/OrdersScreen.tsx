import React, { useState, useMemo } from 'react';
import {
  Search,
  Truck,
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Printer,
  Send,
  Copy,
  Check,
  X,
  Eye,
  Phone,
  MapPin,
  Flame,
  Sparkles,
  Receipt,
  LayoutList,
  LayoutGrid,
  Filter,
  MessageSquare,
  ArrowUpRight,
  RefreshCw,
  Box,
  CreditCard
} from 'lucide-react';
import { Order, OrderStatus, DeliveryType, OrderItem, UserRole } from '../types/crm';
import { THEME_COLORS } from '../styles/theme';

export interface OrdersScreenProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, trackingNumber?: string) => void;
  currentRole?: UserRole;
}

type TabFilter = 'all' | 'PAID' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// Helper to format currency
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
};

// Delivery meta mapping
const getDeliveryMeta = (type: DeliveryType) => {
  switch (type) {
    case 'cdek_pvz':
      return {
        label: 'СДЭК ПВЗ',
        badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        shortName: 'СДЭК ПВЗ'
      };
    case 'cdek_courier':
      return {
        label: 'СДЭК Курьер',
        badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30',
        shortName: 'Курьер СДЭК'
      };
    case 'pochta_russia':
      return {
        label: 'Почта РФ',
        badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
        shortName: 'Почта России'
      };
    case 'self_pickup':
      return {
        label: 'Самовывоз',
        badgeClass: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/30',
        shortName: 'Шоурум'
      };
    default:
      return {
        label: 'Доставка',
        badgeClass: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/30',
        shortName: 'Служба'
      };
  }
};

// Status meta mapping
const getStatusMeta = (status: OrderStatus) => {
  switch (status) {
    case 'PAID':
      return {
        label: 'Оплачен',
        classNames: THEME_COLORS.status.paid.bg,
        icon: CheckCircle2,
        dotColor: 'bg-emerald-500'
      };
    case 'PACKING':
      return {
        label: 'В сборке',
        classNames: THEME_COLORS.status.packing.bg,
        icon: Package,
        dotColor: 'bg-amber-500'
      };
    case 'SHIPPED':
      return {
        label: 'В пути',
        classNames: THEME_COLORS.status.shipped.bg,
        icon: Truck,
        dotColor: 'bg-blue-500'
      };
    case 'DELIVERED':
      return {
        label: 'Доставлен',
        classNames: THEME_COLORS.status.delivered.bg,
        icon: CheckCircle2,
        dotColor: 'bg-emerald-600'
      };
    case 'CANCELLED':
      return {
        label: 'Отменен',
        classNames: THEME_COLORS.status.cancelled.bg,
        icon: XCircle,
        dotColor: 'bg-rose-500'
      };
    case 'PENDING_PAYMENT':
    default:
      return {
        label: 'Ожидает оплаты',
        classNames: THEME_COLORS.status.pending_payment.bg,
        icon: Clock,
        dotColor: 'bg-stone-400'
      };
  }
};

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  orders,
  onUpdateOrderStatus,
  currentRole
}) => {
  // Filters & Search
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals & Active Order
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState<string>('');
  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false);
  const [packingSlipOrder, setPackingSlipOrder] = useState<Order | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tab counters
  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      PAID: orders.filter((o) => o.status === 'PAID').length,
      PACKING: orders.filter((o) => o.status === 'PACKING').length,
      SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab !== 'all' && order.status !== activeTab) {
        return false;
      }

      // Delivery method filter
      if (deliveryFilter !== 'all' && order.deliveryType !== deliveryFilter) {
        return false;
      }

      // Search query: orderNumber, userName, userPhone, trackingNumber, comment
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNumber = order.orderNumber.toLowerCase().includes(query);
        const matchName = order.userName.toLowerCase().includes(query);
        const matchPhone = order.userPhone.toLowerCase().includes(query);
        const matchTrack = order.trackingNumber ? order.trackingNumber.toLowerCase().includes(query) : false;
        const matchTg = order.userTelegram ? order.userTelegram.toLowerCase().includes(query) : false;
        const matchAddress = order.deliveryAddress.toLowerCase().includes(query);

        if (!matchNumber && !matchName && !matchPhone && !matchTrack && !matchTg && !matchAddress) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, deliveryFilter, searchQuery]);

  // Open Details Modal
  const handleOpenDetails = (order: Order, focusTracking = false) => {
    setSelectedOrder(order);
    setTrackingInput(order.trackingNumber || '');
    if (focusTracking) {
      setTimeout(() => {
        const inputEl = document.getElementById('tracking-modal-input');
        if (inputEl) {
          inputEl.focus();
        }
      }, 150);
    }
  };

  // Close Details Modal
  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setTrackingInput('');
  };

  // Handle Save Tracking Number & Notify Client
  const handleSaveTracking = (order: Order) => {
    const track = trackingInput.trim();
    if (!track) return;

    // Update status to SHIPPED
    onUpdateOrderStatus(order.id, 'SHIPPED', track);

    // Update active modal order view
    setSelectedOrder((prev) => (prev ? { ...prev, trackingNumber: track, status: 'SHIPPED' } : null));

    // Show simulated toast
    const targetUser = order.userTelegram || order.userName;
    setToastMessage({
      title: 'Трек-номер успешно сохранен',
      subtitle: `Трек ${track} отправлен клиенту в Telegram (${targetUser})`
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Quick Status change from dropdown or card button
  const handleQuickStatusChange = (orderId: string, newStatus: OrderStatus) => {
    onUpdateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Open Printable Packing Slip
  const handleOpenPackingSlip = (order: Order) => {
    setPackingSlipOrder(order);
    setIsPackingSlipOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] dark:bg-[#141211] text-[#201D1B] dark:text-[#F5F2EE] p-4 md:p-8 space-y-6 transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-[#1C1917] text-[#F5F2EE] dark:bg-[#24201D] dark:text-white p-4 rounded-xl shadow-2xl border border-[#B8683D]/40 backdrop-blur-md max-w-md animate-slide-up">
          <div className="w-9 h-9 rounded-full bg-[#B8683D]/20 border border-[#B8683D] flex items-center justify-center shrink-0 text-[#D9875A]">
            <Send className="w-4 h-4" />
          </div>
          <div className="flex-1 pr-2">
            <h4 className="text-sm font-semibold tracking-wide text-[#FBF9F5]">{toastMessage.title}</h4>
            <p className="text-xs text-[#A39B92] mt-0.5 leading-relaxed">{toastMessage.subtitle}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#78716A] hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D9] dark:border-[#2E2A27] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B8683D]">
            <span>Логистика & CRM</span>
            <span className="w-1 h-1 rounded-full bg-[#B8683D]" />
            <span>Candela Atelier</span>
          </div>
          <h1 className="text-3xl font-cormorant font-normal text-[#201D1B] dark:text-[#F5F2EE] mt-1 tracking-tight">
            Управление заказами
          </h1>
          <p className="text-xs md:text-sm text-[#78716A] dark:text-[#A39B92] mt-1">
            Комплектация ароматов, присвоение трек-номеров и автоматические уведомления покупателей
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#F4EFEA] dark:bg-[#24201D] p-1 rounded-xl border border-[#E8E2D9] dark:border-[#2E2A27]">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#1C1917] text-[#B8683D] shadow-sm font-semibold'
                : 'text-[#78716A] dark:text-[#A39B92] hover:text-[#201D1B] dark:hover:text-[#F5F2EE]'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Таблица</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-[#1C1917] text-[#B8683D] shadow-sm font-semibold'
                : 'text-[#78716A] dark:text-[#A39B92] hover:text-[#201D1B] dark:hover:text-[#F5F2EE]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Карточки</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs with Counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: 'all', label: 'Все заказы' },
            { id: 'PAID', label: 'Новые (Оплачены)' },
            { id: 'PACKING', label: 'В сборке' },
            { id: 'SHIPPED', label: 'В пути' },
            { id: 'DELIVERED', label: 'Доставлены' },
            { id: 'CANCELLED', label: 'Отменены' }
          ] as const
        ).map((tab) => {
          const count = tabCounts[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#B8683D] text-white border-[#B8683D] shadow-sm shadow-[#B8683D]/20'
                  : 'bg-white dark:bg-[#1C1917] text-[#78716A] dark:text-[#A39B92] border-[#E8E2D9] dark:border-[#2E2A27] hover:border-[#B8683D]/40'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full font-semibold transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F4EFEA] dark:bg-[#24201D] text-[#78716A] dark:text-[#A39B92]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1C1917] p-3 rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716A] dark:text-[#A39B92]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по № заказа (CH-1048), клиенту, телефону или треку..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#FBF9F5] dark:bg-[#141211] border border-[#E8E2D9] dark:border-[#2E2A27] rounded-xl text-[#201D1B] dark:text-[#F5F2EE] placeholder-[#78716A] focus:outline-none focus:border-[#B8683D] dark:focus:border-[#D9875A] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716A] hover:text-[#201D1B] dark:hover:text-[#F5F2EE]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Delivery Method Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 absolute left-3 text-[#78716A] dark:text-[#A39B92] pointer-events-none" />
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="pl-8 pr-7 py-2 text-xs bg-[#FBF9F5] dark:bg-[#141211] border border-[#E8E2D9] dark:border-[#2E2A27] rounded-xl text-[#201D1B] dark:text-[#F5F2EE] focus:outline-none focus:border-[#B8683D] dark:focus:border-[#D9875A] cursor-pointer appearance-none"
            >
              <option value="all">Все способы доставки</option>
              <option value="cdek_pvz">СДЭК ПВЗ</option>
              <option value="cdek_courier">СДЭК Курьер</option>
              <option value="pochta_russia">Почта России</option>
              <option value="self_pickup">Самовывоз (Шоурум)</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 text-[#78716A]">▾</div>
          </div>

          {(searchQuery || deliveryFilter !== 'all' || activeTab !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDeliveryFilter('all');
                setActiveTab('all');
              }}
              title="Сбросить все фильтры"
              className="p-2 text-xs text-[#78716A] hover:text-[#B8683D] dark:hover:text-[#D9875A] rounded-xl border border-[#E8E2D9] dark:border-[#2E2A27] bg-[#FBF9F5] dark:bg-[#141211] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] text-center p-6 space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#F4EFEA] dark:bg-[#24201D] flex items-center justify-center text-[#B8683D]">
            <Package className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-semibold text-[#201D1B] dark:text-[#F5F2EE]">
            Заказы не найдены
          </h3>
          <p className="text-xs text-[#78716A] dark:text-[#A39B92] max-w-sm">
            По заданным фильтрам и поисковому запросу ничего не найдено. Попробуйте изменить параметры или сбросить фильтры.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDeliveryFilter('all');
              setActiveTab('all');
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-[#B8683D] hover:bg-[#A0552D] rounded-xl transition-colors shadow-sm"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ================= DESKTOP TABLE VIEW ================= */
        <div className="bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E2D9] dark:border-[#2E2A27] bg-[#FBF9F5] dark:bg-[#141211]/60 text-[#78716A] dark:text-[#A39B92] uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3.5 px-4">№ Заказа & Время</th>
                  <th className="py-3.5 px-4">Клиент</th>
                  <th className="py-3.5 px-4">Состав заказа</th>
                  <th className="py-3.5 px-4">Сумма</th>
                  <th className="py-3.5 px-4">Доставка</th>
                  <th className="py-3.5 px-4">Статус</th>
                  <th className="py-3.5 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]/70 dark:divide-[#2E2A27]/70">
                {filteredOrders.map((order) => {
                  const statusMeta = getStatusMeta(order.status);
                  const deliveryMeta = getDeliveryMeta(order.deliveryType);
                  const totalItemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FBF9F5]/70 dark:hover:bg-[#24201D]/40 transition-colors group"
                    >
                      {/* Order Number & Created At */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleOpenDetails(order)}
                            className="font-mono font-semibold text-sm text-[#201D1B] dark:text-[#F5F2EE] hover:text-[#B8683D] dark:hover:text-[#D9875A] text-left transition-colors flex items-center gap-1"
                          >
                            <span>#{order.orderNumber}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#B8683D]" />
                          </button>
                          <span className="text-[11px] text-[#78716A] dark:text-[#A39B92] flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            {order.createdAt}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 align-top max-w-[200px]">
                        <div className="space-y-0.5">
                          <div className="font-medium text-[#201D1B] dark:text-[#F5F2EE] truncate">
                            {order.userName}
                          </div>
                          <div className="text-[11px] text-[#78716A] dark:text-[#A39B92]">
                            {order.userPhone}
                          </div>
                          {order.userTelegram && (
                            <a
                              href={`https://t.me/${order.userTelegram.replace('@', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#B8683D] dark:text-[#D9875A] hover:underline"
                            >
                              <span>{order.userTelegram}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Items & Wick Breakdown */}
                      <td className="py-4 px-4 align-top max-w-[280px]">
                        <div className="space-y-1.5">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <img
                                src={item.productImage}
                                alt={item.productTitle}
                                className="w-8 h-8 rounded-lg object-cover border border-[#E8E2D9] dark:border-[#2E2A27] shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs text-[#201D1B] dark:text-[#F5F2EE] font-medium truncate">
                                  {item.productTitle}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-[#78716A] dark:text-[#A39B92]">
                                  <span>{item.volume}</span>
                                  {item.wick && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        {item.wick === 'wooden' ? (
                                          <Flame className="w-2.5 h-2.5 text-amber-500" />
                                        ) : (
                                          <Sparkles className="w-2.5 h-2.5 text-stone-400" />
                                        )}
                                        {item.wick === 'wooden' ? 'деревянный' : 'хлопковый'}
                                      </span>
                                    </>
                                  )}
                                  <span>• {item.quantity} шт.</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-[10px] text-[#78716A] dark:text-[#A39B92] pl-10">
                              + еще {order.items.length - 2} поз. (всего {totalItemsCount} шт.)
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Amount & Payment Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-sm text-[#201D1B] dark:text-[#F5F2EE]">
                          {formatPrice(order.totalAmount)}
                        </div>
                        <div className="text-[10px] text-[#78716A] dark:text-[#A39B92] mt-0.5">
                          {order.paymentGateway}
                        </div>
                        {order.bonusDiscount > 0 && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Бонусы: -{formatPrice(order.bonusDiscount)}
                          </div>
                        )}
                      </td>

                      {/* Delivery Service & Address */}
                      <td className="py-4 px-4 align-top max-w-[220px]">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${deliveryMeta.badgeClass}`}
                        >
                          <Truck className="w-2.5 h-2.5" />
                          {deliveryMeta.shortName}
                        </span>
                        <div
                          title={order.deliveryAddress}
                          className="text-[11px] text-[#78716A] dark:text-[#A39B92] line-clamp-2 mt-1 leading-snug"
                        >
                          {order.deliveryAddress}
                        </div>
                        {order.trackingNumber ? (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-[#B8683D] dark:text-[#D9875A] mt-1">
                            <span>{order.trackingNumber}</span>
                            <button
                              onClick={() => handleCopy(order.trackingNumber || '', `tbl-${order.id}`)}
                              className="text-[#78716A] hover:text-[#201D1B] dark:hover:text-[#F5F2EE]"
                              title="Копировать трек"
                            >
                              {copiedKey === `tbl-${order.id}` ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 italic block mt-0.5">
                            Нет трек-номера
                          </span>
                        )}
                      </td>

                      {/* Status & Quick Status Select */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusMeta.classNames}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
                            {statusMeta.label}
                          </span>

                          {/* Quick Status Dropdown */}
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleQuickStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              className="w-full text-[10px] bg-[#F4EFEA] dark:bg-[#24201D] text-[#78716A] dark:text-[#A39B92] border border-[#E8E2D9] dark:border-[#2E2A27] rounded-lg px-2 py-1 focus:outline-none focus:border-[#B8683D] cursor-pointer"
                            >
                              <option value="PAID">Оплачен</option>
                              <option value="PACKING">В сборке</option>
                              <option value="SHIPPED">В пути</option>
                              <option value="DELIVERED">Доставлен</option>
                              <option value="CANCELLED">Отменен</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === 'PAID' && (
                            <button
                              onClick={() => handleQuickStatusChange(order.id, 'PACKING')}
                              title="Взять в сборку"
                              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                            >
                              В сборку
                            </button>
                          )}

                          {order.status === 'PACKING' && (
                            <button
                              onClick={() => handleOpenDetails(order, true)}
                              title="Присвоить трек-номер"
                              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-[#B8683D] text-white hover:bg-[#A0552D] transition-colors shadow-sm"
                            >
                              Ввести трек
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenPackingSlip(order)}
                            title="Распечатать комплектовочный лист"
                            className="p-1.5 rounded-lg text-[#78716A] dark:text-[#A39B92] hover:text-[#201D1B] dark:hover:text-[#F5F2EE] hover:bg-[#F4EFEA] dark:hover:bg-[#24201D] transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenDetails(order)}
                            title="Подробнее о заказе"
                            className="p-1.5 rounded-lg text-[#78716A] dark:text-[#A39B92] hover:text-[#B8683D] dark:hover:text-[#D9875A] hover:bg-[#F4EFEA] dark:hover:bg-[#24201D] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= MOBILE / COMPACT CARDS VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const statusMeta = getStatusMeta(order.status);
            const deliveryMeta = getDeliveryMeta(order.deliveryType);
            const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                {/* Card Top: Order Number, Time & Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleOpenDetails(order)}
                      className="font-mono font-semibold text-base text-[#201D1B] dark:text-[#F5F2EE] hover:text-[#B8683D] dark:hover:text-[#D9875A] transition-colors"
                    >
                      #{order.orderNumber}
                    </button>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusMeta.classNames}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
                      {statusMeta.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#78716A] dark:text-[#A39B92]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {order.createdAt}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${deliveryMeta.badgeClass}`}
                    >
                      {deliveryMeta.label}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-[#FBF9F5] dark:bg-[#141211] p-3 rounded-xl border border-[#E8E2D9]/70 dark:border-[#2E2A27]/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-[#201D1B] dark:text-[#F5F2EE]">
                      {order.userName}
                    </span>
                    {order.userTelegram && (
                      <a
                        href={`https://t.me/${order.userTelegram.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#B8683D] dark:text-[#D9875A] font-medium hover:underline"
                      >
                        {order.userTelegram}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#78716A] dark:text-[#A39B92]">
                    <Phone className="w-3 h-3" />
                    <span>{order.userPhone}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px] text-[#78716A] dark:text-[#A39B92] pt-1 border-t border-[#E8E2D9]/40 dark:border-[#2E2A27]/40">
                    <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-[#B8683D]" />
                    <span className="line-clamp-2">{order.deliveryAddress}</span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-[#78716A] dark:text-[#A39B92] font-semibold flex justify-between">
                    <span>Товары ({totalItems} шт.)</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 text-xs text-[#201D1B] dark:text-[#F5F2EE]"
                      >
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-8 h-8 rounded-lg object-cover border border-[#E8E2D9] dark:border-[#2E2A27] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{item.productTitle}</div>
                          <div className="text-[10px] text-[#78716A] dark:text-[#A39B92] flex items-center gap-1">
                            <span>{item.volume}</span>
                            {item.wick && (
                              <span>
                                • {item.wick === 'wooden' ? 'деревянный' : 'хлопковый'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs shrink-0 font-medium">
                          {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking section if present */}
                {order.trackingNumber && (
                  <div className="flex items-center justify-between bg-[#F4EFEA]/80 dark:bg-[#24201D]/80 px-3 py-2 rounded-xl text-xs">
                    <span className="text-[#78716A] dark:text-[#A39B92]">Трек-номер:</span>
                    <div className="flex items-center gap-1 font-mono font-medium text-[#B8683D] dark:text-[#D9875A]">
                      <span>{order.trackingNumber}</span>
                      <button
                        onClick={() => handleCopy(order.trackingNumber || '', `crd-${order.id}`)}
                        className="p-1 hover:text-[#201D1B] dark:hover:text-[#F5F2EE]"
                      >
                        {copiedKey === `crd-${order.id}` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer: Total & Direct Action Buttons */}
                <div className="pt-3 border-t border-[#E8E2D9] dark:border-[#2E2A27] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#78716A] dark:text-[#A39B92]">
                        Итого к оплате
                      </div>
                      <div className="text-lg font-bold text-[#201D1B] dark:text-[#F5F2EE]">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenPackingSlip(order)}
                      title="Лист сборки"
                      className="p-2 rounded-xl border border-[#E8E2D9] dark:border-[#2E2A27] text-[#78716A] hover:text-[#201D1B] dark:hover:text-[#F5F2EE] hover:bg-[#F4EFEA] dark:hover:bg-[#24201D] transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {order.status === 'PAID' && (
                      <button
                        onClick={() => handleQuickStatusChange(order.id, 'PACKING')}
                        className="py-2 px-3 text-xs font-medium rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                      >
                        В сборку
                      </button>
                    )}

                    {order.status === 'PACKING' && (
                      <button
                        onClick={() => handleOpenDetails(order, true)}
                        className="py-2 px-3 text-xs font-medium rounded-xl bg-[#B8683D] text-white hover:bg-[#A0552D] transition-colors shadow-sm"
                      >
                        Ввести трек
                      </button>
                    )}

                    {order.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleQuickStatusChange(order.id, 'DELIVERED')}
                        className="py-2 px-3 text-xs font-medium rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                      >
                        Вручен
                      </button>
                    )}

                    {order.status !== 'PAID' &&
                      order.status !== 'PACKING' &&
                      order.status !== 'SHIPPED' && (
                        <div className="text-[11px] text-[#78716A] flex items-center">
                          Статус зафиксирован
                        </div>
                      )}

                    <button
                      onClick={() => handleOpenDetails(order)}
                      className="py-2 px-3 text-xs font-medium rounded-xl bg-[#F4EFEA] dark:bg-[#24201D] text-[#201D1B] dark:text-[#F5F2EE] hover:bg-[#ECE6DF] dark:hover:bg-[#2E2925] border border-[#E8E2D9] dark:border-[#2E2A27] transition-colors text-center"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= ORDER DETAILS MODAL / DRAWER ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#1C1917] rounded-3xl border border-[#E8E2D9] dark:border-[#2E2A27] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#E8E2D9] dark:border-[#2E2A27] flex items-center justify-between bg-[#FBF9F5] dark:bg-[#141211]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#B8683D]/10 flex items-center justify-center text-[#B8683D]">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-mono text-[#201D1B] dark:text-[#F5F2EE]">
                      #{selectedOrder.orderNumber}
                    </h2>
                    {(() => {
                      const meta = getStatusMeta(selectedOrder.status);
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.classNames}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                          {meta.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-[#78716A] dark:text-[#A39B92] mt-0.5">
                    Создан: {selectedOrder.createdAt} • Изменен: {selectedOrder.updatedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenPackingSlip(selectedOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E8E2D9] dark:border-[#2E2A27] bg-white dark:bg-[#1C1917] text-[#201D1B] dark:text-[#F5F2EE] hover:bg-[#F4EFEA] dark:hover:bg-[#24201D] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Лист сборки</span>
                </button>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 rounded-xl text-[#78716A] hover:text-[#201D1B] dark:hover:text-[#F5F2EE] hover:bg-[#F4EFEA] dark:hover:bg-[#24201D] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Order Comment (if any) */}
              {selectedOrder.comment && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                      Примечание от клиента:
                    </div>
                    <div className="text-xs text-amber-800 dark:text-amber-400/90 mt-0.5 italic">
                      «{selectedOrder.comment}»
                    </div>
                  </div>
                </div>
              )}

              {/* Items Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716A] dark:text-[#A39B92]">
                  Состав отправления ({selectedOrder.items.length} поз.)
                </h3>
                <div className="divide-y divide-[#E8E2D9] dark:divide-[#2E2A27] border border-[#E8E2D9] dark:border-[#2E2A27] rounded-2xl overflow-hidden bg-[#FBF9F5]/40 dark:bg-[#141211]/30">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-12 h-12 rounded-xl object-cover border border-[#E8E2D9] dark:border-[#2E2A27] shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-[#201D1B] dark:text-[#F5F2EE] truncate">
                            {item.productTitle}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#78716A] dark:text-[#A39B92]">
                            <span className="px-2 py-0.5 rounded-md bg-[#F4EFEA] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27]">
                              {item.volume}
                            </span>
                            {item.wick && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4EFEA] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27]">
                                {item.wick === 'wooden' ? (
                                  <Flame className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <Sparkles className="w-3 h-3 text-stone-400" />
                                )}
                                {item.wick === 'wooden' ? 'Деревянный фитиль' : 'Хлопковый фитиль'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-[#78716A] dark:text-[#A39B92]">
                          {item.quantity} шт. × {formatPrice(item.price)}
                        </div>
                        <div className="text-sm font-bold text-[#201D1B] dark:text-[#F5F2EE] mt-0.5">
                          {formatPrice(item.quantity * item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Recipient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Delivery Box */}
                <div className="p-4 rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] bg-[#FBF9F5] dark:bg-[#141211] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716A] dark:text-[#A39B92]">
                      Служба доставки
                    </h3>
                    {(() => {
                      const dMeta = getDeliveryMeta(selectedOrder.deliveryType);
                      return (
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${dMeta.badgeClass}`}
                        >
                          {dMeta.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="text-xs space-y-1.5 text-[#201D1B] dark:text-[#F5F2EE]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#B8683D] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{selectedOrder.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-[#E8E2D9]/70 dark:border-[#2E2A27]/70 text-[#78716A] dark:text-[#A39B92]">
                      <Truck className="w-3.5 h-3.5 text-[#B8683D]" />
                      <span>Стоимость тарифа: {formatPrice(selectedOrder.deliveryCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Recipient Box */}
                <div className="p-4 rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] bg-[#FBF9F5] dark:bg-[#141211] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716A] dark:text-[#A39B92]">
                    Получатель
                  </h3>
                  <div className="text-xs space-y-1.5">
                    <div className="font-semibold text-sm text-[#201D1B] dark:text-[#F5F2EE]">
                      {selectedOrder.userName}
                    </div>
                    <div className="flex items-center gap-2 text-[#78716A] dark:text-[#A39B92]">
                      <Phone className="w-3.5 h-3.5" />
                      <a
                        href={`tel:${selectedOrder.userPhone}`}
                        className="hover:text-[#B8683D] dark:hover:text-[#D9875A] transition-colors"
                      >
                        {selectedOrder.userPhone}
                      </a>
                    </div>
                    {selectedOrder.userTelegram && (
                      <div className="flex items-center gap-2 text-[#B8683D] dark:text-[#D9875A]">
                        <Send className="w-3.5 h-3.5" />
                        <a
                          href={`https://t.me/${selectedOrder.userTelegram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline font-medium"
                        >
                          {selectedOrder.userTelegram}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details & Receipt */}
              <div className="p-4 rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] bg-[#FBF9F5] dark:bg-[#141211] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716A] dark:text-[#A39B92]">
                    Оплата & Финансы
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{selectedOrder.paymentGateway}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[#78716A] dark:text-[#A39B92] block text-[11px]">
                      Товары:
                    </span>
                    <span className="font-medium text-[#201D1B] dark:text-[#F5F2EE]">
                      {formatPrice(selectedOrder.subtotal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#78716A] dark:text-[#A39B92] block text-[11px]">
                      Доставка:
                    </span>
                    <span className="font-medium text-[#201D1B] dark:text-[#F5F2EE]">
                      +{formatPrice(selectedOrder.deliveryCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#78716A] dark:text-[#A39B92] block text-[11px]">
                      Скидка бонусами:
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      -{formatPrice(selectedOrder.bonusDiscount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#78716A] dark:text-[#A39B92] block text-[11px]">
                      Итого к оплате:
                    </span>
                    <span className="font-bold text-sm text-[#B8683D] dark:text-[#D9875A]">
                      {formatPrice(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E2D9]/70 dark:border-[#2E2A27]/70">
                  <div className="flex items-center gap-1.5 text-xs text-[#78716A] dark:text-[#A39B92]">
                    <span>ID транзакции:</span>
                    <span className="font-mono text-[#201D1B] dark:text-[#F5F2EE]">
                      {selectedOrder.paymentTransactionId}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedOrder.paymentTransactionId, 'txid')}
                      className="p-1 hover:text-[#B8683D]"
                    >
                      {copiedKey === 'txid' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <a
                    href={`https://yookassa.ru/doc/receipt-simulation?tx=${selectedOrder.paymentTransactionId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#B8683D] dark:text-[#D9875A] font-medium hover:underline"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Электронный чек ОФД</span>
                  </a>
                </div>
              </div>

              {/* TRACKING NUMBER SECTION & NOTIFY TELEGRAM */}
              <div className="p-5 rounded-2xl border-2 border-[#B8683D]/30 bg-gradient-to-br from-[#B8683D]/5 to-transparent space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#B8683D]" />
                    <h3 className="text-sm font-semibold text-[#201D1B] dark:text-[#F5F2EE]">
                      Присвоение трек-номера отправления
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#78716A] dark:text-[#A39B92]">
                    Автосмена статуса на «В пути»
                  </span>
                </div>

                <p className="text-xs text-[#78716A] dark:text-[#A39B92]">
                  Введите номер накладной СДЭК или Почты РФ. При сохранении бот отправит трек-номер и ссылку отслеживания покупателю в Telegram.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      id="tracking-modal-input"
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Например, CDEK-1456789012 или 12345678901234"
                      className="w-full font-mono text-sm px-3.5 py-2.5 bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] rounded-xl text-[#201D1B] dark:text-[#F5F2EE] focus:outline-none focus:border-[#B8683D] dark:focus:border-[#D9875A]"
                    />
                  </div>
                  <button
                    onClick={() => handleSaveTracking(selectedOrder)}
                    disabled={!trackingInput.trim()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-[#B8683D] hover:bg-[#A0552D] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#B8683D]/20 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Сохранить и уведомить клиента</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E8E2D9] dark:border-[#2E2A27] bg-[#FBF9F5] dark:bg-[#141211] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#78716A] dark:text-[#A39B92]">Сменить статус:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleQuickStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="text-xs bg-white dark:bg-[#1C1917] text-[#201D1B] dark:text-[#F5F2EE] border border-[#E8E2D9] dark:border-[#2E2A27] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#B8683D] cursor-pointer"
                >
                  <option value="PAID">Оплачен</option>
                  <option value="PACKING">В сборке</option>
                  <option value="SHIPPED">В пути</option>
                  <option value="DELIVERED">Доставлен</option>
                  <option value="CANCELLED">Отменен</option>
                </select>
              </div>

              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 text-xs font-medium text-[#78716A] hover:text-[#201D1B] dark:hover:text-[#F5F2EE] transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRINTABLE PACKING SLIP MODAL ================= */}
      {isPackingSlipOpen && packingSlipOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white text-black p-8 rounded-3xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:m-0 print:p-0 print:max-w-none print:shadow-none print:rounded-none">
            {/* Action Bar for non-print view */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Printer className="w-4 h-4 text-[#B8683D]" />
                <span>Предпросмотр комплектовочного листа</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#B8683D] text-white hover:bg-[#A0552D] transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Печать на принтере</span>
                </button>
                <button
                  onClick={() => setIsPackingSlipOpen(false)}
                  className="p-2 rounded-xl text-stone-500 hover:text-black hover:bg-stone-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Atelier Sheet Design */}
            <div className="space-y-6 font-sans">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-stone-800 pb-4">
                <div>
                  <h1 className="font-cormorant text-2xl tracking-widest uppercase font-semibold text-stone-900">
                    CANDELA HOME
                  </h1>
                  <p className="text-[10px] uppercase tracking-widest text-stone-500 mt-0.5">
                    Ателье селективных свечей & ароматов для дома
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-base font-bold text-stone-900">
                    КОМПЛЕКТОВОЧНЫЙ ЛИСТ
                  </div>
                  <div className="font-mono text-sm text-[#B8683D] font-bold">
                    #{packingSlipOrder.orderNumber}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Дата: {packingSlipOrder.createdAt}
                  </div>
                </div>
              </div>

              {/* Logistics & Recipient */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div>
                  <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px] mb-1">
                    Получатель:
                  </div>
                  <div className="font-semibold text-stone-900">{packingSlipOrder.userName}</div>
                  <div className="text-stone-600 mt-0.5">{packingSlipOrder.userPhone}</div>
                  {packingSlipOrder.userTelegram && (
                    <div className="text-stone-600 mt-0.5">TG: {packingSlipOrder.userTelegram}</div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px] mb-1">
                    Доставка ({getDeliveryMeta(packingSlipOrder.deliveryType).label}):
                  </div>
                  <div className="text-stone-800 leading-snug">
                    {packingSlipOrder.deliveryAddress}
                  </div>
                  {packingSlipOrder.trackingNumber && (
                    <div className="font-mono text-stone-900 font-semibold mt-1">
                      Трек: {packingSlipOrder.trackingNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-300 text-stone-600 uppercase text-[10px] tracking-wider">
                      <th className="py-2 px-2 w-8 text-center">✓</th>
                      <th className="py-2 px-2">Позиция / Аромат</th>
                      <th className="py-2 px-2">Объем</th>
                      <th className="py-2 px-2">Фитиль</th>
                      <th className="py-2 px-2 text-center">Кол-во</th>
                      <th className="py-2 px-2 text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {packingSlipOrder.items.map((item, idx) => (
                      <tr key={item.id} className="text-stone-800">
                        <td className="py-3 px-2 text-center">
                          <div className="w-4 h-4 border border-stone-400 rounded mx-auto" />
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {idx + 1}. {item.productTitle}
                        </td>
                        <td className="py-3 px-2 text-stone-600">{item.volume}</td>
                        <td className="py-3 px-2 text-stone-600">
                          {item.wick === 'wooden' ? 'Деревянный (щепа)' : 'Хлопковый'}
                        </td>
                        <td className="py-3 px-2 text-center font-bold">{item.quantity} шт.</td>
                        <td className="py-3 px-2 text-right font-medium">
                          {formatPrice(item.quantity * item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Notes / Comment */}
              {packingSlipOrder.comment && (
                <div className="p-3 bg-stone-100 rounded-lg text-xs border border-stone-200">
                  <span className="font-bold text-stone-800">Примечание к упаковке: </span>
                  <span className="italic text-stone-700">«{packingSlipOrder.comment}»</span>
                </div>
              )}

              {/* Total & Sign-off */}
              <div className="border-t border-stone-300 pt-4 flex justify-between items-end text-xs">
                <div className="space-y-4">
                  <div className="text-stone-600 text-[11px]">
                    Упаковано с заботой в фирменную крафтовую коробку с тишью.
                  </div>
                  <div className="flex items-center gap-4 text-stone-700 pt-2">
                    <span>Сборщик: ____________________</span>
                    <span>Контроль: ____________________</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-stone-600 text-[11px]">
                    Подытог: {formatPrice(packingSlipOrder.subtotal)}
                  </div>
                  {packingSlipOrder.bonusDiscount > 0 && (
                    <div className="text-stone-600 text-[11px]">
                      Скидка: -{formatPrice(packingSlipOrder.bonusDiscount)}
                    </div>
                  )}
                  <div className="text-stone-600 text-[11px]">
                    Доставка: {formatPrice(packingSlipOrder.deliveryCost)}
                  </div>
                  <div className="text-base font-bold text-stone-900 border-t border-stone-300 pt-1">
                    Итого: {formatPrice(packingSlipOrder.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersScreen;
