import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  Flame,
  Boxes,
  TicketPercent,
  Star,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  ChevronDown,
  Check,
  MoreHorizontal,
  X,
  ShieldCheck,
  Bell,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types/crm';
import { ROLE_PERMISSIONS } from '../../styles/theme';

export interface NavItemDef {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: 'terracotta' | 'amber' | 'emerald';
}

export const ALL_NAV_ITEMS: NavItemDef[] = [
  {
    id: 'dashboard',
    label: 'Аналитика',
    sublabel: 'Финансы и KPI',
    icon: LayoutDashboard
  },
  {
    id: 'orders',
    label: 'Заказы',
    sublabel: 'Сборка и доставка',
    icon: Package,
    badge: 14,
    badgeVariant: 'amber'
  },
  {
    id: 'catalog',
    label: 'Каталог',
    sublabel: 'Пирамиды и ароматы',
    icon: Flame
  },
  {
    id: 'inventory',
    label: 'Склад',
    sublabel: 'Остатки и пороги',
    icon: Boxes,
    badge: 2,
    badgeVariant: 'terracotta'
  },
  {
    id: 'marketing',
    label: 'Маркетинг',
    sublabel: 'Промокоды и CRM',
    icon: TicketPercent
  },
  {
    id: 'reviews',
    label: 'Отзывы',
    sublabel: 'Модерация и ответы',
    icon: Star,
    badge: 1,
    badgeVariant: 'emerald'
  },
  {
    id: 'staff',
    label: 'Команда',
    sublabel: 'Сотрудники и RBAC',
    icon: Users
  }
];

export interface NavigationProps {
  activeScreen: string;
  setActiveScreen: (screenId: string) => void;
  currentRole?: UserRole;
  setCurrentRole?: (role: UserRole) => void;
  theme?: 'dark' | 'light';
  setTheme?: (theme: 'dark' | 'light') => void;
  isDark?: boolean;
  toggleTheme?: () => void;
  viewportMode?: 'desktop' | 'mobile_tma' | 'mobile';
  setViewportMode?: (mode: any) => void;
  isMobileView?: boolean;
  children?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeScreen,
  setActiveScreen,
  currentRole: propRole,
  setCurrentRole: propSetRole,
  theme: propTheme,
  setTheme: propSetTheme,
  isDark: propIsDark,
  toggleTheme: propToggleTheme,
  viewportMode: propViewportMode = 'desktop',
  setViewportMode: propSetViewportMode,
  isMobileView = false,
  children
}) => {
  // Local fallback states if not controlled
  const [internalRole, setInternalRole] = useState<UserRole>('OWNER');
  const [internalTheme, setInternalTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);

  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const currentRole = propRole ?? internalRole;
  const setCurrentRole = propSetRole ?? setInternalRole;

  // Resolve theme
  const currentTheme = propTheme ?? (propIsDark !== undefined ? (propIsDark ? 'dark' : 'light') : internalTheme);
  const isDarkTheme = currentTheme === 'dark';

  const handleToggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else if (propSetTheme) {
      propSetTheme(isDarkTheme ? 'light' : 'dark');
    } else {
      const nextTheme = isDarkTheme ? 'light' : 'dark';
      setInternalTheme(nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleToggleViewport = () => {
    if (propSetViewportMode) {
      const isCurrentlyDesktop = propViewportMode === 'desktop';
      propSetViewportMode(isCurrentlyDesktop ? 'mobile_tma' : 'desktop');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // RBAC filtering
  const allowedScreens = ROLE_PERMISSIONS[currentRole]?.allowedScreens || [];
  const visibleNavItems = ALL_NAV_ITEMS.filter(item => allowedScreens.includes(item.id));

  // Auto-switch screen if activeScreen is forbidden in current role
  useEffect(() => {
    if (allowedScreens.length > 0 && !allowedScreens.includes(activeScreen)) {
      setActiveScreen(allowedScreens[0]);
    }
  }, [currentRole, activeScreen, allowedScreens, setActiveScreen]);

  const currentRoleConfig = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.OWNER;

  const rolesList: { role: UserRole; label: string; desc: string; badge: string }[] = [
    {
      role: 'OWNER',
      label: 'Владелец',
      desc: 'Полный доступ ко всем модулям и финансам',
      badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
    },
    {
      role: 'ADMIN',
      label: 'Управляющий',
      desc: 'Заказы, склад, каталог, маркетинг и отзывы',
      badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
    },
    {
      role: 'MANAGER',
      label: 'Сборщик / Логист',
      desc: 'Сборка посылок, треки и остатки',
      badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
    },
    {
      role: 'EDITOR',
      label: 'Контент-менеджер',
      desc: 'Описания пирамид и ответы на отзывы',
      badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30'
    }
  ];

  // Mobile navigation tabs calculation
  const primaryMobileCount = 4;
  const primaryMobileItems = visibleNavItems.slice(0, primaryMobileCount);

  // -------------------------------------------------------------
  // RENDER: MOBILE TMA VIEW (Header + Bottom Bar)
  // -------------------------------------------------------------
  if (isMobileView) {
    return (
      <>
        {/* Top TMA Header */}
        <header className="sticky top-0 z-30 w-full h-14 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 px-4 flex items-center justify-between select-none">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#B8683D] to-[#8E4420] text-white flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 text-amber-200 animate-pulse" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif font-cormorant text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Candela
              </span>
              <span className="text-[8px] uppercase tracking-[0.25em] text-[#B8683D] font-bold">
                Control Hub
              </span>
            </div>
          </div>

          {/* Right Header Controls: Role Badge + Switcher Dropdown & Theme */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={roleDropdownRef}>
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-[11px] font-medium"
              >
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${currentRoleConfig.badge}`}>
                  {currentRoleConfig.label}
                </span>
                <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#1C1917] border border-stone-200 dark:border-stone-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-stone-100 dark:border-stone-800 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      RBAC Профиль
                    </p>
                  </div>
                  {rolesList.map(item => (
                    <button
                      key={item.role}
                      onClick={() => {
                        setCurrentRole(item.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-stone-50 dark:hover:bg-stone-800/60 ${
                        item.role === currentRole ? 'bg-[#B8683D]/10 text-[#B8683D] font-semibold' : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        <span className="text-[10px] text-stone-400 line-clamp-1">{item.desc}</span>
                      </div>
                      {item.role === currentRole && <Check className="w-3.5 h-3.5 text-[#B8683D]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-center text-stone-600 dark:text-stone-300"
              title="Переключить тему"
            >
              {isDarkTheme ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Fixed Mobile Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-md border-t border-stone-200/90 dark:border-stone-800/90 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {primaryMobileItems.map(item => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                  isActive ? 'text-[#B8683D] dark:text-[#D9875A]' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 px-1 text-[8px] font-bold rounded-full bg-[#B8683D] text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* "Ещё" button */}
          <button
            onClick={() => setIsMobileSheetOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium tracking-tight">Ещё</span>
          </button>
        </div>

        {/* Mobile Bottom Sheet for Secondary Items */}
        {isMobileSheetOpen && (
          <div
            className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsMobileSheetOpen(false)}
          >
            <div
              className="w-full bg-white dark:bg-[#1C1917] rounded-t-3xl border-t border-stone-200 dark:border-stone-800 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <span className="font-serif font-cormorant text-xl font-bold text-stone-900 dark:text-stone-100">
                  Все разделы
                </span>
                <button onClick={() => setIsMobileSheetOpen(false)} className="p-1 text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 py-4">
                {visibleNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveScreen(item.id);
                        setIsMobileSheetOpen(false);
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left ${
                        isActive
                          ? 'border-[#B8683D] bg-[#B8683D]/10 text-[#B8683D] dark:text-[#D9875A] font-semibold'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{item.label}</p>
                        <p className="text-[10px] text-stone-400 truncate">{item.sublabel}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // -------------------------------------------------------------
  // RENDER: DESKTOP SIDEBAR VIEW
  // -------------------------------------------------------------
  return (
    <aside
      className={`h-screen flex flex-col border-r border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-md transition-all duration-300 relative select-none z-20 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white dark:bg-[#24201D] border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-center text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 z-30 transition-transform hover:scale-110"
        title={isSidebarCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Top Brand Logo */}
      <div className="p-4 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B8683D] to-[#8E4420] text-white flex items-center justify-center shadow-sm shadow-[#B8683D]/20 ring-1 ring-[#B8683D]/30 flex-shrink-0">
          <Flame className="w-5 h-5 text-amber-200 animate-pulse" />
        </div>
        {!isSidebarCollapsed && (
          <div className="flex flex-col leading-none truncate">
            <span className="font-serif font-cormorant text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 truncate">
              Candela
            </span>
            <span className="text-[9px] uppercase tracking-[0.28em] text-[#B8683D] font-bold mt-0.5 truncate">
              Control Hub
            </span>
          </div>
        )}
      </div>

      {/* Header Controls: Role Switcher, Viewport Mode, Theme Toggle */}
      <div className="p-3 border-b border-stone-200/60 dark:border-stone-800/60 space-y-2">
        {/* Role Switcher */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`w-full flex items-center gap-2 p-2 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all text-xs font-medium ${
              isSidebarCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title="Переключить роль (RBAC Демо)"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border truncate ${currentRoleConfig.badge}`}>
                {isSidebarCollapsed ? currentRoleConfig.label.slice(0, 3) : currentRoleConfig.label}
              </span>
            </div>
            {!isSidebarCollapsed && (
              <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Role Dropdown */}
          {isRoleDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#1C1917] border border-stone-200 dark:border-stone-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-stone-100 dark:border-stone-800 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Переключение роли (RBAC)
                </p>
              </div>
              {rolesList.map(item => {
                const isSelected = item.role === currentRole;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      setCurrentRole(item.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-start justify-between text-xs hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors ${
                      isSelected ? 'bg-[#B8683D]/10 text-[#B8683D]' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{item.label}</span>
                        <span className={`text-[9px] px-1 py-0.2 rounded border ${item.badge}`}>
                          {item.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 line-clamp-1">{item.desc}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#B8683D] flex-shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Viewport and Theme Quick Bar */}
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between gap-1 pt-1">
            {/* Viewport mode toggle */}
            <button
              onClick={handleToggleViewport}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 text-xs font-medium transition-colors"
              title="Переключить TMA / Десктоп"
            >
              {propViewportMode === 'desktop' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#B8683D]" />
                  <span className="text-[11px]">TMA 430px</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-[#B8683D]" />
                  <span className="text-[11px]">Десктоп</span>
                </>
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={handleToggleTheme}
              className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-[#B8683D] transition-colors flex-shrink-0"
              title={isDarkTheme ? 'Светлая тема' : 'Тёмная тема'}
            >
              {isDarkTheme ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleToggleViewport}
              className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-500"
              title="Переключить режим экрана"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleTheme}
              className="w-8 h-8 rounded-lg border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-500"
              title="Тема"
            >
              {isDarkTheme ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Modules List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {!isSidebarCollapsed && (
          <div className="px-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">
              Модули
            </span>
          </div>
        )}

        {visibleNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                isActive
                  ? 'bg-[#B8683D]/10 text-[#B8683D] dark:text-[#D9875A] font-semibold shadow-xs ring-1 ring-[#B8683D]/20'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/80 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-200'
              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#B8683D] rounded-r-full" />
              )}

              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                  isActive
                    ? 'text-[#B8683D] dark:text-[#D9875A]'
                    : 'text-stone-400 group-hover:text-stone-600 dark:text-stone-500 dark:group-hover:text-stone-300'
                }`}
              />

              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium truncate leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
                      {item.sublabel}
                    </span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeVariant === 'terracotta'
                          ? 'bg-[#B8683D]/15 text-[#B8683D] dark:text-[#D9875A]'
                          : item.badgeVariant === 'emerald'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {isSidebarCollapsed && item.badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B8683D]" />
              )}
            </button>
          );
        })}
      </div>

      {/* User Card / Footer */}
      <div className="p-3 border-t border-stone-200/80 dark:border-stone-800/80">
        {!isSidebarCollapsed ? (
          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-bold text-xs text-[#B8683D] flex-shrink-0">
                CH
              </div>
              <div className="flex flex-col min-w-0 truncate">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                  Candela Staff
                </span>
                <span className="text-[10px] text-stone-400 truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  {currentRoleConfig.label}
                </span>
              </div>
            </div>
            <button
              onClick={() => alert('Демо: завершение сессии')}
              className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => alert('Демо: завершение сессии')}
              className="p-2 text-stone-400 hover:text-rose-500 rounded-lg transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Render children if supplied */}
      {children}
    </aside>
  );
};

export default Navigation;
