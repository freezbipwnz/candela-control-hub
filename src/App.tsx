import React, { useState, useEffect } from 'react';
import { UserRole, Order, OrderStatus, Product, PromoCode, Review, StaffMember, DashboardKPI } from './types/crm';
import { INITIAL_KPI, INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_PROMOS, INITIAL_REVIEWS, INITIAL_STAFF } from './data/mockData';
import { ROLE_PERMISSIONS } from './styles/theme';

import { Navigation } from './components/navigation/Navigation';
import { DashboardScreen } from './screens/DashboardScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { MarketingScreen } from './screens/MarketingScreen';
import { ReviewsScreen } from './screens/ReviewsScreen';
import { StaffScreen } from './screens/StaffScreen';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('OWNER');
  const [activeScreen, setActiveScreen] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile_tma'>('desktop');

  // Shared Data State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [promos, setPromos] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [kpi, setKpi] = useState<DashboardKPI>(INITIAL_KPI);

  // Toast notifications
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4000);
  };

  // Sync theme to root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Enforce RBAC when currentRole changes
  useEffect(() => {
    const allowed = ROLE_PERMISSIONS[currentRole].allowedScreens;
    if (!allowed.includes(activeScreen)) {
      setActiveScreen(allowed[0] || 'orders');
    }
  }, [currentRole, activeScreen]);

  // Order Handlers
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, trackingNumber?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = {
            ...ord,
            status: newStatus,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber,
            updatedAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
          };
          return updated;
        }
        return ord;
      })
    );

    if (newStatus === 'SHIPPED') {
      showToast(`📦 Заказ переведён в статус «В пути». Трек-номер ${trackingNumber || 'СДЭК'} отправлен клиенту в Telegram!`, 'success');
    } else {
      showToast(`Статус заказа изменен на ${newStatus}`, 'info');
    }
  };

  // Product Handlers
  const handleToggleProductActive = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedState = !p.isActive;
          showToast(`Товар «${p.title}» ${updatedState ? 'опубликован на витрине' : 'скрыт из витрины'}`);
          return { ...p, isActive: updatedState };
        }
        return p;
      })
    );
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updatedProduct.id);
      if (exists) {
        showToast(`Товар «${updatedProduct.title}» успешно обновлен`);
        return prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      } else {
        showToast(`Товар «${updatedProduct.title}» успешно добавлен в каталог`);
        return [updatedProduct, ...prev];
      }
    });
  };

  // Stock Handlers
  const handleUpdateStock = (productId: string, variantId: string, deltaOrValue: number, isAbsolute = false) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            variants: p.variants.map((v) => {
              if (v.id === variantId) {
                const newStock = isAbsolute ? Math.max(0, deltaOrValue) : Math.max(0, v.stock + deltaOrValue);
                return { ...v, stock: newStock };
              }
              return v;
            })
          };
        }
        return p;
      })
    );
    showToast(`Остаток на складе обновлен`, 'info');
  };

  // Promo Code Handlers
  const handleTogglePromoActive = (promoId: string) => {
    setPromos((prev) =>
      prev.map((pr) => {
        if (pr.id === promoId) {
          const next = !pr.isActive;
          showToast(`Промокод ${pr.code} ${next ? 'активирован' : 'приостановлен'}`);
          return { ...pr, isActive: next };
        }
        return pr;
      })
    );
  };

  const handleAddPromo = (newPromo: PromoCode) => {
    setPromos((prev) => [newPromo, ...prev]);
    showToast(`Промокод ${newPromo.code} успешно создан!`);
  };

  // Reviews Handlers
  const handleUpdateReviewStatus = (reviewId: string, newStatus: 'published' | 'rejected') => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
    );
    showToast(newStatus === 'published' ? 'Отзыв опубликован на витрине' : 'Отзыв отклонен');
  };

  const handleBrandReply = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              brandReply: {
                text: replyText,
                repliedAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                authorName: 'Candela Home Care'
              }
            }
          : r
      )
    );
    showToast('Официальный ответ бренда успешно опубликован под отзывом!');
  };

  // Staff Handlers
  const handleAddStaff = (newMember: StaffMember) => {
    setStaff((prev) => [...prev, newMember]);
    showToast(`Сотрудник ${newMember.name} добавлен в систему с ролью ${newMember.role}`);
  };

  const handleRevokeStaff = (staffId: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
    showToast('Доступ сотрудника успешно отозван', 'warning');
  };

  // Active Screen Content Renderer
  const renderScreenContent = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen kpi={kpi} orders={orders} products={products} />;
      case 'orders':
        return <OrdersScreen orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} currentRole={currentRole} />;
      case 'catalog':
        return (
          <CatalogScreen
            products={products}
            onToggleActive={handleToggleProductActive}
            onSaveProduct={handleSaveProduct}
            currentRole={currentRole}
          />
        );
      case 'inventory':
        return (
          <InventoryScreen
            products={products}
            onUpdateStock={handleUpdateStock}
            currentRole={currentRole}
          />
        );
      case 'marketing':
        return (
          <MarketingScreen
            promos={promos}
            onTogglePromo={handleTogglePromoActive}
            onAddPromo={handleAddPromo}
            currentRole={currentRole}
          />
        );
      case 'reviews':
        return (
          <ReviewsScreen
            reviews={reviews}
            onUpdateStatus={handleUpdateReviewStatus}
            onBrandReply={handleBrandReply}
            currentRole={currentRole}
          />
        );
      case 'staff':
        return (
          <StaffScreen
            staff={staff}
            onAddStaff={handleAddStaff}
            onRevokeStaff={handleRevokeStaff}
            currentRole={currentRole}
          />
        );
      default:
        return <DashboardScreen kpi={kpi} orders={orders} products={products} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#141211] text-[#201D1B] dark:text-[#F5F2EE] transition-colors duration-200">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-3 duration-300 max-w-md bg-white/95 dark:bg-[#1C1917]/95 border-stone-200 dark:border-stone-800 text-sm">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
          <span className="font-medium text-stone-800 dark:text-stone-200 leading-tight">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Viewport Modes */}
      {viewportMode === 'desktop' ? (
        // Desktop / Tablet CRM Mode
        <div className="flex h-screen overflow-hidden">
          <Navigation
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
            activeScreen={activeScreen}
            setActiveScreen={setActiveScreen}
            theme={theme}
            setTheme={setTheme}
            viewportMode={viewportMode}
            setViewportMode={setViewportMode}
            isMobileView={false}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FBF9F5] dark:bg-[#141211]">
            <div className="max-w-7xl mx-auto space-y-6">
              {renderScreenContent()}
            </div>
          </main>
        </div>
      ) : (
        // Mobile / TMA Phone Simulator Mode
        <div className="min-h-screen bg-stone-900/90 py-4 px-2 flex flex-col items-center justify-center">
          {/* Top Simulator Controls Toolbar */}
          <div className="w-full max-w-[430px] mb-3 flex items-center justify-between px-3 py-2 bg-stone-800/90 rounded-2xl border border-stone-700/60 backdrop-blur-md shadow-lg text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono font-medium">Telegram Mini App (430px)</span>
            </div>
            <button
              onClick={() => setViewportMode('desktop')}
              className="px-2.5 py-1 rounded-lg bg-[#B8683D] hover:bg-[#A0552D] text-white font-medium transition-colors"
            >
              💻 На десктоп
            </button>
          </div>

          {/* Realistic Mobile Device Frame */}
          <div className="w-full max-w-[430px] h-[880px] bg-[#FBF9F5] dark:bg-[#141211] rounded-[44px] shadow-2xl border-[6px] border-stone-800 flex flex-col overflow-hidden relative">
            {/* Dynamic Island / Speaker notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-800 rounded-full z-40 pointer-events-none"></div>

            <Navigation
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              theme={theme}
              setTheme={setTheme}
              viewportMode={viewportMode}
              setViewportMode={setViewportMode}
              isMobileView={true}
            />

            {/* Scrollable Mobile Viewport */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
              {renderScreenContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
