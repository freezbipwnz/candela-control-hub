// Candela Control Hub — Design Tokens & UI Helpers
// Warm Quiet Luxury & Modern Minimalist Admin Palette

export const THEME_COLORS = {
  // Brand accents
  terracotta: '#B8683D',
  terracottaHover: '#A0552D',
  terracottaDark: '#D9875A',
  amber: '#D97706',
  
  // Light Theme
  light: {
    bg: '#FBF9F5',
    card: '#FFFFFF',
    surface: '#F4EFEA',
    surfaceHover: '#ECE6DF',
    border: '#E8E2D9',
    textMain: '#201D1B',
    textMuted: '#78716A',
  },

  // Dark Theme
  dark: {
    bg: '#141211',
    card: '#1C1917',
    surface: '#24201D',
    surfaceHover: '#2E2925',
    border: '#2E2A27',
    textMain: '#F5F2EE',
    textMuted: '#A39B92',
  },

  // Statuses
  status: {
    paid: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'Оплачен' },
    packing: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'В сборке' },
    shipped: { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', label: 'В пути' },
    delivered: { bg: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-600/30', label: 'Доставлен' },
    cancelled: { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', label: 'Отменен' },
    pending_payment: { bg: 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20', label: 'Ожидает оплаты' },
  }
};

export const ROLE_PERMISSIONS = {
  OWNER: {
    label: 'Владелец',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    description: 'Полный доступ ко всем модулям и финансам',
    allowedScreens: ['dashboard', 'orders', 'catalog', 'inventory', 'marketing', 'reviews', 'staff']
  },
  ADMIN: {
    label: 'Управляющий',
    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    description: 'Заказы, склад, каталог, маркетинг и отзывы',
    allowedScreens: ['dashboard', 'orders', 'catalog', 'inventory', 'marketing', 'reviews']
  },
  MANAGER: {
    label: 'Сборщик / Логист',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    description: 'Сборка посылок, накладные, треки и остатки',
    allowedScreens: ['orders', 'inventory']
  },
  EDITOR: {
    label: 'Контент-менеджер',
    badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    description: 'Описания пирамид, фото и ответы на отзывы',
    allowedScreens: ['catalog', 'reviews']
  }
};
