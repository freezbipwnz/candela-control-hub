import React, { useState, useMemo } from 'react';
import { StaffMember, UserRole } from '../types/crm';
import { INITIAL_STAFF } from '../data/mockData';
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  KeyRound,
  Crown,
  Briefcase,
  PenTool,
  Check,
  X,
  Sparkles,
  Info
} from 'lucide-react';

interface RoleDefinition {
  role: UserRole;
  title: string;
  badgeLabel: string;
  badgeClass: string;
  icon: React.ReactNode;
  summary: string;
  permissions: {
    canViewFinance: boolean;
    canManageStaff: boolean;
    canManageCatalog: boolean;
    canManagePromos: boolean;
    canProcessOrders: boolean;
    canManageStock: boolean;
    canModerateReviews: boolean;
    canEditBanner: boolean;
  };
}

const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  OWNER: {
    role: 'OWNER',
    title: 'Владелец (Owner)',
    badgeLabel: 'Основатель / Owner',
    badgeClass: 'bg-brand-terracotta/15 text-brand-terracotta dark:text-brand-terracotta-dark border-brand-terracotta/30',
    icon: <Crown className="w-3.5 h-3.5 text-brand-terracotta" />,
    summary: 'Абсолютный доступ ко всем модулям, финансовой отчётности, API-ключам и управлению персоналом.',
    permissions: {
      canViewFinance: true,
      canManageStaff: true,
      canManageCatalog: true,
      canManagePromos: true,
      canProcessOrders: true,
      canManageStock: true,
      canModerateReviews: true,
      canEditBanner: true,
    },
  },
  ADMIN: {
    role: 'ADMIN',
    title: 'Администратор (Admin)',
    badgeLabel: 'Администратор',
    badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />,
    summary: 'Управление каталогом, заказами, акциями и персоналом (кроме удаления Владельца).',
    permissions: {
      canViewFinance: false,
      canManageStaff: true,
      canManageCatalog: true,
      canManagePromos: true,
      canProcessOrders: true,
      canManageStock: true,
      canModerateReviews: true,
      canEditBanner: true,
    },
  },
  MANAGER: {
    role: 'MANAGER',
    title: 'Менеджер (Manager)',
    badgeLabel: 'Менеджер заказов',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    icon: <Briefcase className="w-3.5 h-3.5 text-emerald-600" />,
    summary: 'Обработка заказов, смена статусов, учет складских остатков и печать накладных доставки.',
    permissions: {
      canViewFinance: false,
      canManageStaff: false,
      canManageCatalog: false,
      canManagePromos: false,
      canProcessOrders: true,
      canManageStock: true,
      canModerateReviews: false,
      canEditBanner: false,
    },
  },
  EDITOR: {
    role: 'EDITOR',
    title: 'Контент-редактор (Editor)',
    badgeLabel: 'Контент & Отзывы',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    icon: <PenTool className="w-3.5 h-3.5 text-amber-600" />,
    summary: 'Модерация отзывов покупателей, официальные ответы бренда и редактирование описаний.',
    permissions: {
      canViewFinance: false,
      canManageStaff: false,
      canManageCatalog: false,
      canManagePromos: false,
      canProcessOrders: false,
      canManageStock: false,
      canModerateReviews: true,
      canEditBanner: true,
    },
  },
};

const PERMISSION_LABELS: { key: keyof RoleDefinition['permissions']; label: string }[] = [
  { key: 'canViewFinance', label: 'Доступ к выручке, прибыли и финансовым отчетам' },
  { key: 'canManageStaff', label: 'Добавление и редактирование прав сотрудников' },
  { key: 'canManageCatalog', label: 'Редактирование ароматов, объемов и цен' },
  { key: 'canManagePromos', label: 'Создание промокодов и скидочных кампаний' },
  { key: 'canProcessOrders', label: 'Обработка заказов и смена статусов СДЭК' },
  { key: 'canManageStock', label: 'Корректировка складских остатков' },
  { key: 'canModerateReviews', label: 'Модерация отзывов и публикация ответов бренда' },
  { key: 'canEditBanner', label: 'Редактирование главного промо-баннера витрины' },
];

export interface StaffScreenProps {
  staff?: StaffMember[];
  onAddStaff?: (newMember: StaffMember) => void;
  onRevokeStaff?: (staffId: string) => void;
  currentRole?: UserRole;
}

export const StaffScreen: React.FC<StaffScreenProps> = ({
  staff: propStaff,
  onAddStaff: propOnAddStaff,
  onRevokeStaff: propOnRevokeStaff,
  currentRole = 'OWNER'
}) => {
  const [staff, setStaff] = useState<StaffMember[]>(propStaff || INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  // Modal State for adding new staff
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTelegramId, setFormTelegramId] = useState('');
  const [formTelegramUsername, setFormTelegramUsername] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('MANAGER');
  const [formError, setFormError] = useState<string | null>(null);

  // Modal State for editing role
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);

  // Active staff count
  const activeCount = useMemo(() => {
    return staff.filter((s) => s.isActive).length;
  }, [staff]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      if (roleFilter !== 'all' && member.role !== roleFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(query);
        const matchesTgId = member.telegramId.toLowerCase().includes(query);
        const matchesUsername = (member.telegramUsername || '').toLowerCase().includes(query);
        return matchesName || matchesTgId || matchesUsername;
      }

      return true;
    });
  }, [staff, roleFilter, searchQuery]);

  // Toggle active / revoke access
  const handleToggleActive = (member: StaffMember) => {
    if (member.role === 'OWNER') {
      alert('Невозможно заблокировать или отозвать доступ у Основателя (Owner).');
      return;
    }

    const actionText = member.isActive ? 'отозвать доступ у' : 'восстановить доступ для';
    if (confirm(`Вы уверены, что хотите ${actionText} ${member.name}?`)) {
      setStaff((prev) =>
        prev.map((s) => (s.id === member.id ? { ...s, isActive: !s.isActive } : s))
      );
    }
  };

  // Submit Add Staff
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Укажите имя и должность сотрудника');
      return;
    }
    if (!formTelegramId.trim() || !/^\d+$/.test(formTelegramId.trim())) {
      setFormError('Telegram ID должен состоять только из цифр (например, 847291039)');
      return;
    }

    // Check if ID already exists
    if (staff.some((s) => s.telegramId === formTelegramId.trim())) {
      setFormError('Сотрудник с таким Telegram ID уже зарегистрирован в системе');
      return;
    }

    const cleanUsername = formTelegramUsername.trim()
      ? formTelegramUsername.startsWith('@')
        ? formTelegramUsername
        : `@${formTelegramUsername}`
      : undefined;

    const newMember: StaffMember = {
      id: `st-${Date.now()}`,
      name: formName.trim(),
      telegramId: formTelegramId.trim(),
      telegramUsername: cleanUsername,
      role: formRole,
      addedAt: new Date().toISOString().slice(0, 10),
      lastActive: 'Только что добавлен',
      isActive: true,
    };

    setStaff([...staff, newMember]);
    setIsAddModalOpen(false);
    setFormError(null);
    setFormName('');
    setFormTelegramId('');
    setFormTelegramUsername('');
    setFormRole('MANAGER');
  };

  // Submit Edit Role
  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffMember) return;

    setStaff((prev) =>
      prev.map((s) =>
        s.id === editingStaffMember.id ? { ...s, role: editingStaffMember.role } : s
      )
    );
    setEditingStaffMember(null);
  };

  return (
    <div className="min-h-screen bg-atelier-bg dark:bg-atelier-dark-bg text-[#2D2A26] dark:text-[#E8E2D9] font-sans p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-atelier-border dark:border-atelier-dark-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase bg-brand-terracotta/10 text-brand-terracotta dark:bg-brand-terracotta-dark/15 dark:text-brand-terracotta-dark">
              <KeyRound className="w-3.5 h-3.5" /> Доступ & Команда
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-cormorant font-semibold tracking-tight text-[#1C1917] dark:text-[#FBF9F5]">
            Сотрудники и роли (RBAC)
          </h1>
          <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mt-1">
            Управление персоналом, распределение зон ответственности и авторизация через Telegram ID
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border text-xs sm:text-sm">
            <span className="text-[#78716C] dark:text-[#A8A29E]">Активно: </span>
            <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </strong>{' '}
            <span className="text-[#78716C]">/ {staff.length} сотрудников</span>
          </div>

          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-terracotta hover:bg-brand-terracotta-hover transition-all shadow-sm active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Добавить сотрудника</span>
          </button>
        </div>
      </div>

      {/* RBAC ROLES EXPLANATION BANNER */}
      <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-terracotta" />
            <h2 className="text-lg sm:text-xl font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
              Матрица ролевого доступа Candela Control Hub
            </h2>
          </div>
          <span className="text-xs text-[#78716C] dark:text-[#A8A29E] hidden sm:inline">
            Принцип наименьших привилегий (Zero-Trust)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((rKey) => {
            const def = ROLE_DEFINITIONS[rKey];
            return (
              <div
                key={rKey}
                className="p-3.5 rounded-xl border border-atelier-border/80 dark:border-atelier-dark-border/80 bg-atelier-surface/40 dark:bg-atelier-dark-surface/40 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${def.badgeClass}`}
                    >
                      {def.icon}
                      <span>{def.title}</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] leading-relaxed">
                    {def.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-atelier-border/50 dark:border-atelier-dark-border/50 text-[11px] text-[#A8A29E]">
                  Разрешений: {Object.values(def.permissions).filter(Boolean).length} из 8
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STAFF MEMBERS TABLE */}
      <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
              Реестр учётных записей
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] dark:text-[#A8A29E]">
              Сотрудники, имеющие доступ к панели управления и Telegram боту администратора
            </p>
          </div>

          {/* Search & Role Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="px-3 py-1.5 text-xs rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
            >
              <option value="all">Все роли</option>
              <option value="OWNER">Владелец (Owner)</option>
              <option value="ADMIN">Администратор (Admin)</option>
              <option value="MANAGER">Менеджер (Manager)</option>
              <option value="EDITOR">Редактор (Editor)</option>
            </select>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                placeholder="Поиск по имени или ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-atelier-border dark:border-atelier-dark-border text-[11px] font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                <th className="py-3 px-4">Сотрудник</th>
                <th className="py-3 px-4">Telegram ID / Ник</th>
                <th className="py-3 px-4">Роль в системе</th>
                <th className="py-3 px-4">Дата добавления</th>
                <th className="py-3 px-4">Последняя активность</th>
                <th className="py-3 px-4 text-center">Статус доступа</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-atelier-border/60 dark:divide-atelier-dark-border/60 text-sm">
              {filteredStaff.map((member) => {
                const roleDef = ROLE_DEFINITIONS[member.role];
                const isOwner = member.role === 'OWNER';

                return (
                  <tr
                    key={member.id}
                    className={`hover:bg-atelier-surface/50 dark:hover:bg-atelier-dark-surface/50 transition-colors ${
                      !member.isActive ? 'opacity-60 bg-zinc-50 dark:bg-zinc-900/30' : ''
                    }`}
                  >
                    {/* Name & Avatar initials */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold tracking-wider ${
                            isOwner
                              ? 'bg-brand-terracotta text-white shadow-xs'
                              : 'bg-atelier-surface dark:bg-atelier-dark-surface text-[#78716C] border border-atelier-border dark:border-atelier-dark-border'
                          }`}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
                            {member.name}
                          </div>
                          {isOwner && (
                            <span className="text-[10px] uppercase font-bold text-brand-terracotta dark:text-brand-terracotta-dark">
                              Главный администратор
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Telegram ID & Username */}
                    <td className="py-4 px-4 font-mono text-xs">
                      <div className="text-[#1C1917] dark:text-[#FBF9F5] font-semibold">
                        {member.telegramId}
                      </div>
                      {member.telegramUsername ? (
                        <a
                          href={`https://t.me/${member.telegramUsername.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#78716C] hover:text-brand-terracotta inline-flex items-center gap-0.5 mt-0.5"
                        >
                          {member.telegramUsername}
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-[#A8A29E] italic text-[11px]">без никнейма</span>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleDef.badgeClass}`}
                      >
                        {roleDef.icon}
                        <span>{roleDef.badgeLabel}</span>
                      </span>
                    </td>

                    {/* Added Date */}
                    <td className="py-4 px-4 text-xs text-[#78716C] dark:text-[#A8A29E]">
                      {member.addedAt}
                    </td>

                    {/* Last active status */}
                    <td className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            member.isActive &&
                            (member.lastActive.includes('Сейчас') ||
                              member.lastActive.includes('минут'))
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-zinc-400'
                          }`}
                        />
                        <span className="text-[#78716C] dark:text-[#A8A29E]">
                          {member.lastActive}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {member.isActive ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      {isOwner ? (
                        <span className="text-xs text-[#A8A29E] italic">Защищённая роль</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Role Button */}
                          <button
                            title="Изменить роль"
                            onClick={() => setEditingStaffMember(member)}
                            className="p-1.5 rounded-lg text-[#78716C] hover:text-brand-terracotta hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Revoke / Restore Access */}
                          <button
                            title={member.isActive ? 'Отозвать доступ' : 'Восстановить доступ'}
                            onClick={() => handleToggleActive(member)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              member.isActive
                                ? 'text-[#78716C] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                            }`}
                          >
                            {member.isActive ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STAFF MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-atelier-border dark:border-atelier-dark-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-brand-terracotta/10 text-brand-terracotta">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
                    Добавить сотрудника в команду
                  </h3>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    Авторизация происходит через верифицированный Telegram ID
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#78716C] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddStaffSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                  Имя и должность сотрудника
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Екатерина (Консультант)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                />
              </div>

              {/* Telegram ID & Username in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                    Telegram ID (только цифры)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="847291039"
                    value={formTelegramId}
                    onChange={(e) => setFormTelegramId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                  />
                  <span className="text-[11px] text-[#A8A29E] mt-1 block">
                    Узнать ID можно в @userinfobot
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                    Никнейм @username (опционально)
                  </label>
                  <input
                    type="text"
                    placeholder="@ekaterina_c"
                    value={formTelegramUsername}
                    onChange={(e) => setFormTelegramUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                  />
                </div>
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-1.5">
                  Назначаемая роль
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-atelier-border dark:border-atelier-dark-border bg-atelier-surface dark:bg-atelier-dark-surface text-[#1C1917] dark:text-[#FBF9F5] focus:outline-none focus:border-brand-terracotta"
                >
                  <option value="ADMIN">ADMIN — Администратор (Каталог, заказы, промо, персонал)</option>
                  <option value="MANAGER">MANAGER — Менеджер заказов и склада (Сборка, СДЭК, остатки)</option>
                  <option value="EDITOR">EDITOR — Контент-редактор (Отзывы, ответы бренда, витрина)</option>
                </select>
              </div>

              {/* Dynamic Permissions Preview Checklist */}
              <div className="p-4 rounded-xl bg-atelier-surface/50 dark:bg-atelier-dark-surface/50 border border-atelier-border dark:border-atelier-dark-border space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-terracotta" />
                    Права доступа для роли «{ROLE_DEFINITIONS[formRole].title}»:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {PERMISSION_LABELS.map((item) => {
                    const hasPerm = ROLE_DEFINITIONS[formRole].permissions[item.key];
                    return (
                      <div
                        key={item.key}
                        className={`flex items-start gap-2 p-1.5 rounded-lg ${
                          hasPerm
                            ? 'text-[#1C1917] dark:text-[#FBF9F5]'
                            : 'text-[#A8A29E] line-through opacity-60'
                        }`}
                      >
                        {hasPerm ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-tight">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-atelier-border dark:border-atelier-dark-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-[#78716C] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-brand-terracotta hover:bg-brand-terracotta-hover transition-colors shadow-xs"
                >
                  Предоставить доступ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {editingStaffMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-atelier-card dark:bg-atelier-dark-card border border-atelier-border dark:border-atelier-dark-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between p-5 border-b border-atelier-border dark:border-atelier-dark-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-brand-terracotta/10 text-brand-terracotta">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-cormorant font-semibold text-[#1C1917] dark:text-[#FBF9F5]">
                    Изменить роль сотрудника
                  </h3>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    {editingStaffMember.name} ({editingStaffMember.telegramId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStaffMember(null)}
                className="p-1.5 rounded-lg text-[#78716C] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditRoleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] mb-2">
                  Выберите новую роль
                </label>
                <div className="space-y-2">
                  {(['ADMIN', 'MANAGER', 'EDITOR'] as UserRole[]).map((rKey) => {
                    const rDef = ROLE_DEFINITIONS[rKey];
                    const isSelected = editingStaffMember.role === rKey;

                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() =>
                          setEditingStaffMember({ ...editingStaffMember, role: rKey })
                        }
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-brand-terracotta bg-brand-terracotta/10 shadow-xs'
                            : 'border-atelier-border dark:border-atelier-dark-border hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-sm text-[#1C1917] dark:text-[#FBF9F5]">
                            {rDef.title}
                          </div>
                          <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                            {rDef.summary}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-terracotta" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-atelier-border dark:border-atelier-dark-border">
                <button
                  type="button"
                  onClick={() => setEditingStaffMember(null)}
                  className="px-4 py-2 rounded-lg text-sm text-[#78716C] hover:bg-atelier-surface dark:hover:bg-atelier-dark-surface transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-brand-terracotta hover:bg-brand-terracotta-hover transition-colors shadow-xs"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffScreen;
