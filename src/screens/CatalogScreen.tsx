import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Flame,
  Droplets,
  Feather,
  Sparkles,
  Edit3,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Check,
  X,
  Image as ImageIcon,
  Clock,
  Layers,
  Tag,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Product, ProductVariant, OlfactoryPyramid, UserRole } from '../types/crm';
import { INITIAL_PRODUCTS } from '../data/mockData';

export interface CatalogScreenProps {
  products?: Product[];
  onToggleActive?: (productId: string) => void;
  onSaveProduct?: (updatedProduct: Product) => void;
  onProductsChange?: (products: Product[]) => void;
  currentRole?: UserRole;
}

type CategoryType = 'all' | 'candles' | 'diffusers' | 'sachets' | 'sets';

const CATEGORIES: { id: CategoryType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'Все товары', icon: Sparkles },
  { id: 'candles', label: 'Свечи', icon: Flame },
  { id: 'diffusers', label: 'Диффузоры', icon: Droplets },
  { id: 'sachets', label: 'Саше', icon: Feather },
  { id: 'sets', label: 'Наборы', icon: Layers }
];

const MARKETING_BADGES = [
  'Хит сезона',
  'Масла Граса',
  'New',
  'Лимитированный тираж',
  'Эксклюзив',
  'Ароматерапия'
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1572726729437-3732efed37c1?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&q=80&w=600'
];

const PYRAMID_SUGGESTIONS = {
  top: ['Лист табака', 'Пряный имбирь', 'Кориандр', 'Эвкалипт', 'Иглы пихты', 'Бергамот', 'Розовый перец', 'Зеленый кардамон'],
  heart: ['Бобы тонка', 'Цветок табака', 'Какао', 'Сладкий мёд', 'Ягоды можжевельника', 'Майсурский сандал', 'Ирис', 'Мякоть инжира'],
  base: ['Бурбонская ваниль', 'Древесный аккорд', 'Сухофрукты', 'Дубовый мох', 'Серая амбра', 'Белый кедр', 'Амброксан', 'Мускус']
};

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  products: initialProductsProp,
  onToggleActive,
  onSaveProduct,
  onProductsChange,
  currentRole = 'OWNER'
}) => {
  const [products, setProducts] = useState<Product[]>(initialProductsProp || INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const canEdit = currentRole === 'OWNER' || currentRole === 'ADMIN' || currentRole === 'EDITOR';

  // Sync with prop when parent updates products
  useEffect(() => {
    if (initialProductsProp) {
      setProducts(initialProductsProp);
    }
  }, [initialProductsProp]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    title: string;
    slug: string;
    category: 'candles' | 'diffusers' | 'sachets' | 'sets';
    subtitle: string;
    description: string;
    basePrice: number;
    images: string[];
    pyramid: OlfactoryPyramid;
    variants: ProductVariant[];
    wickOptions: ('wooden' | 'cotton')[];
    marketingBadge: string;
    isActive: boolean;
  }>({
    id: '',
    title: '',
    slug: '',
    category: 'candles',
    subtitle: '',
    description: '',
    basePrice: 1890,
    images: [PRESET_IMAGES[0]],
    pyramid: {
      topNotes: [],
      heartNotes: [],
      baseNotes: []
    },
    variants: [
      { id: 'v-1', volume: '100 мл', priceDelta: 0, finalPrice: 1890, burnTime: 'до 25 часов', stock: 15, costPrice: 490 },
      { id: 'v-2', volume: '250 мл', priceDelta: 650, finalPrice: 2540, burnTime: 'до 55 часов', stock: 10, costPrice: 750 }
    ],
    wickOptions: ['wooden', 'cotton'],
    marketingBadge: 'Хит сезона',
    isActive: true
  });

  // Note chip inputs
  const [topNoteInput, setTopNoteInput] = useState('');
  const [heartNoteInput, setHeartNoteInput] = useState('');
  const [baseNoteInput, setBaseNoteInput] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateProductList = (newProducts: Product[]) => {
    setProducts(newProducts);
    if (onProductsChange) {
      onProductsChange(newProducts);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter === 'active' && !p.isActive) return false;
      if (selectedStatusFilter === 'hidden' && p.isActive) return false;
      // Badge filter
      if (selectedBadgeFilter !== 'all' && p.marketingBadge !== selectedBadgeFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSubtitle = p.subtitle.toLowerCase().includes(query);
        const matchesSlug = p.slug.toLowerCase().includes(query);
        const matchesNotes = [
          ...p.pyramid.topNotes,
          ...p.pyramid.heartNotes,
          ...p.pyramid.baseNotes
        ].some((n) => n.toLowerCase().includes(query));
        return matchesTitle || matchesSubtitle || matchesSlug || matchesNotes;
      }
      return true;
    });
  }, [products, selectedCategory, selectedStatusFilter, selectedBadgeFilter, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      all: products.length,
      candles: 0,
      diffusers: 0,
      sachets: 0,
      sets: 0
    };
    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [products]);

  // Quick Toggle Active/Hidden
  const handleToggleActive = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) {
      alert('У вас нет прав для изменения каталога товаров');
      return;
    }
    if (onToggleActive) {
      onToggleActive(productId);
    } else {
      const updated = products.map((p) => {
        if (p.id === productId) {
          const nextState = !p.isActive;
          showToast(nextState ? `«${p.title}» активирован в каталоге` : `«${p.title}» скрыт из витрины`);
          return { ...p, isActive: nextState };
        }
        return p;
      });
      updateProductList(updated);
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: `prod-${Date.now()}`,
      title: '',
      slug: '',
      category: selectedCategory === 'all' ? 'candles' : selectedCategory,
      subtitle: '',
      description: '',
      basePrice: 1890,
      images: [PRESET_IMAGES[0]],
      pyramid: {
        topNotes: ['Лист табака', 'Пряный имбирь'],
        heartNotes: ['Бобы тонка', 'Цветок табака'],
        baseNotes: ['Бурбонская ваниль', 'Древесный аккорд']
      },
      variants: [
        { id: `v-${Date.now()}-1`, volume: '100 мл', priceDelta: 0, finalPrice: 1890, burnTime: 'до 25 часов', stock: 15, costPrice: 490 },
        { id: `v-${Date.now()}-2`, volume: '250 мл', priceDelta: 650, finalPrice: 2540, burnTime: 'до 55 часов', stock: 8, costPrice: 750 }
      ],
      wickOptions: ['wooden', 'cotton'],
      marketingBadge: 'Хит сезона',
      isActive: true
    });
    setTopNoteInput('');
    setHeartNoteInput('');
    setBaseNoteInput('');
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProduct(product);
    setFormData({
      id: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      subtitle: product.subtitle,
      description: product.description,
      basePrice: product.basePrice,
      images: [...product.images],
      pyramid: {
        topNotes: [...product.pyramid.topNotes],
        heartNotes: [...product.pyramid.heartNotes],
        baseNotes: [...product.pyramid.baseNotes]
      },
      variants: product.variants.map((v) => ({ ...v })),
      wickOptions: [...product.wickOptions],
      marketingBadge: product.marketingBadge || '',
      isActive: product.isActive
    });
    setTopNoteInput('');
    setHeartNoteInput('');
    setBaseNoteInput('');
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  // Duplicate Product
  const handleDuplicateProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      title: `${product.title} (Копия)`,
      slug: `${product.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      variants: product.variants.map((v) => ({
        ...v,
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      }))
    };
    const updated = [newProduct, ...products];
    updateProductList(updated);
    showToast(`Создана копия аромата «${product.title}»`);
  };

  // Delete Product
  const handleDeleteProduct = (productId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Вы уверены, что хотите удалить аромат «${title}» из каталога?`)) {
      const updated = products.filter((p) => p.id !== productId);
      updateProductList(updated);
      showToast(`Аромат «${title}» удален`);
    }
  };

  // Auto slug generation from title
  const generateSlug = (text: string) => {
    const cyrillicToLatin: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i',
      й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
      у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
      ь: '', э: 'e', ю: 'yu', я: 'ya'
    };
    return text
      .toLowerCase()
      .split('')
      .map((char) => cyrillicToLatin[char] || char)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.title) ? generateSlug(newTitle) : prev.slug
    }));
  };

  // Pyramid chip helpers
  const handleAddNote = (type: 'top' | 'heart' | 'base', note: string) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    const key = type === 'top' ? 'topNotes' : type === 'heart' ? 'heartNotes' : 'baseNotes';
    if (!formData.pyramid[key].includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        pyramid: {
          ...prev.pyramid,
          [key]: [...prev.pyramid[key], trimmed]
        }
      }));
    }
    if (type === 'top') setTopNoteInput('');
    if (type === 'heart') setHeartNoteInput('');
    if (type === 'base') setBaseNoteInput('');
  };

  const handleRemoveNote = (type: 'top' | 'heart' | 'base', index: number) => {
    const key = type === 'top' ? 'topNotes' : type === 'heart' ? 'heartNotes' : 'baseNotes';
    setFormData((prev) => ({
      ...prev,
      pyramid: {
        ...prev.pyramid,
        [key]: prev.pyramid[key].filter((_, i) => i !== index)
      }
    }));
  };

  // Image Gallery helpers
  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url.trim()]
    }));
    setNewImageUrl('');
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const newImages = [...prev.images];
      const selected = newImages.splice(index, 1)[0];
      newImages.unshift(selected);
      return { ...prev, images: newImages };
    });
  };

  const handleRemoveImage = (index: number) => {
    if (formData.images.length <= 1) {
      alert('У товара должна оставаться хотя бы одна фотография');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Variant table helpers
  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setFormData((prev) => {
      const nextVariants = [...prev.variants];
      const target = { ...nextVariants[index], [field]: value };

      if (field === 'priceDelta') {
        const delta = Number(value) || 0;
        target.finalPrice = prev.basePrice + delta;
      }
      nextVariants[index] = target;
      return { ...prev, variants: nextVariants };
    });
  };

  const handleAddVariantRow = () => {
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}`,
      volume: formData.variants.length === 0 ? '100 мл' : `${(formData.variants.length + 1) * 100} мл`,
      priceDelta: formData.variants.length === 0 ? 0 : 700,
      finalPrice: formData.basePrice + (formData.variants.length === 0 ? 0 : 700),
      burnTime: 'до 45 часов',
      stock: 10,
      costPrice: 550
    };
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const handleRemoveVariantRow = (index: number) => {
    if (formData.variants.length <= 1) {
      alert('У товара должен быть как минимум один вариант объема');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Wick toggle helper
  const handleToggleWick = (wick: 'wooden' | 'cotton') => {
    setFormData((prev) => {
      const exists = prev.wickOptions.includes(wick);
      const nextWicks = exists
        ? prev.wickOptions.filter((w) => w !== wick)
        : [...prev.wickOptions, wick];
      return { ...prev, wickOptions: nextWicks };
    });
  };

  // Submit Modal
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Укажите название аромата');
      return;
    }

    if (formData.variants.length === 0) {
      alert('Добавьте хотя бы один вариант объема');
      return;
    }

    const finalProduct: Product = {
      id: formData.id || `prod-${Date.now()}`,
      title: formData.title.trim(),
      slug: formData.slug.trim() || generateSlug(formData.title),
      category: formData.category,
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim(),
      basePrice: Number(formData.basePrice) || 1890,
      images: formData.images.length > 0 ? formData.images : [PRESET_IMAGES[0]],
      pyramid: formData.pyramid,
      variants: formData.variants.map((v) => ({
        ...v,
        finalPrice: (Number(formData.basePrice) || 1890) + (Number(v.priceDelta) || 0)
      })),
      wickOptions: formData.wickOptions,
      marketingBadge: formData.marketingBadge || undefined,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      isActive: formData.isActive,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString().split('T')[0]
    };

    if (onSaveProduct) {
      onSaveProduct(finalProduct);
    } else if (editingProduct) {
      const updated = products.map((p) => (p.id === editingProduct.id ? finalProduct : p));
      updateProductList(updated);
      showToast(`Аромат «${finalProduct.title}» успешно обновлен`);
    } else {
      const updated = [finalProduct, ...products];
      updateProductList(updated);
      showToast(`Новый аромат «${finalProduct.title}» добавлен в коллекцию`);
    }

    setIsModalOpen(false);
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
            <span className="text-xs uppercase tracking-widest text-[#B8683D] font-semibold">Candela Home Atelier</span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">Селективная коллекция</span>
          </div>
          <h1 className="font-serif font-cormorant text-3xl md:text-4xl font-normal text-stone-900 dark:text-stone-100 tracking-wide mt-1">
            Каталог ароматов
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Управление парфюмерными свечами, интерьерными диффузорами и восковыми саше. Настройка ольфакторных пирамид и вариантов объема.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switch */}
          <div className="flex items-center bg-[#F4EFEA] dark:bg-[#24201D] p-1 rounded-xl border border-[#E8E2D9] dark:border-[#2E2A27]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#1C1917] text-[#B8683D] shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Сетка карточек"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#1C1917] text-[#B8683D] shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Таблица каталога"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Product Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B8683D] hover:bg-[#A0552D] text-white font-medium text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить товар</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Quick Stats Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id];
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#B8683D] text-white shadow-sm'
                    : 'bg-white dark:bg-[#1C1917] text-stone-700 dark:text-stone-300 border border-[#E8E2D9] dark:border-[#2E2A27] hover:bg-[#F4EFEA] dark:hover:bg-[#24201D]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-stone-500'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по аромату, нотам или артикулу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Marketing Badge Filter */}
          <select
            value={selectedBadgeFilter}
            onChange={(e) => setSelectedBadgeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
          >
            <option value="all">Все бейджи</option>
            {MARKETING_BADGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as 'all' | 'active' | 'hidden')}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
          >
            <option value="all">Любой статус</option>
            <option value="active">Только активные</option>
            <option value="hidden">Только скрытые</option>
          </select>
        </div>
      </div>

      {/* Main Content: Grid vs Table */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] text-center">
          <div className="w-16 h-16 rounded-full bg-[#F4EFEA] dark:bg-[#24201D] flex items-center justify-center text-stone-400 mb-4">
            <Search className="w-8 h-8 stroke-1 text-[#B8683D]" />
          </div>
          <h3 className="font-serif font-cormorant text-2xl text-stone-800 dark:text-stone-200">
            Ничего не найдено
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mt-1 mb-6">
            Попробуйте сбросить поисковый запрос или выбрать другую категорию ароматов.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedBadgeFilter('all');
              setSelectedStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider text-[#B8683D] border border-[#B8683D]/30 hover:bg-[#B8683D]/10 transition-all"
          >
            Сбросить все фильтры
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
            const isLowStock = product.variants.some((v) => v.stock < 5);

            return (
              <div
                key={product.id}
                onClick={() => handleOpenEditModal(product)}
                className={`group relative flex flex-col bg-white dark:bg-[#1C1917] rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden ${
                  product.isActive
                    ? 'border-[#E8E2D9] dark:border-[#2E2A27]'
                    : 'border-dashed border-stone-300 dark:border-stone-700 opacity-75'
                }`}
              >
                {/* Product Image Box */}
                <div className="relative aspect-[4/3] w-full bg-[#F4EFEA] dark:bg-[#24201D] overflow-hidden">
                  <img
                    src={product.images[0] || PRESET_IMAGES[0]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
                    {product.marketingBadge && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 dark:bg-stone-900/90 text-[#B8683D] shadow-sm backdrop-blur-sm border border-[#B8683D]/20">
                        {product.marketingBadge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-medium bg-stone-900/70 text-white backdrop-blur-sm">
                      {product.category === 'candles'
                        ? 'Свеча'
                        : product.category === 'diffusers'
                        ? 'Диффузор'
                        : product.category === 'sachets'
                        ? 'Саше'
                        : 'Сет'}
                    </span>
                  </div>

                  {/* Quick Toggle Switch in Corner */}
                  <div
                    className="absolute top-3 right-3 z-10"
                    onClick={(e) => handleToggleActive(product.id, e)}
                    title={product.isActive ? 'Товар виден в магазине. Нажмите, чтобы скрыть' : 'Товар скрыт. Нажмите, чтобы опубликовать'}
                  >
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-md transition-all cursor-pointer ${
                        product.isActive
                          ? 'bg-emerald-500/90 hover:bg-emerald-600 text-white'
                          : 'bg-stone-800/80 hover:bg-stone-900 text-stone-300'
                      }`}
                    >
                      {product.isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Витрина</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Скрыт</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stock warning pill if critical */}
                  {isLowStock && (
                    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-semibold shadow-sm">
                      <AlertCircle className="w-3 h-3" />
                      <span>Мало на складе</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title & Subtitle */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif font-cormorant text-xl font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#B8683D] transition-colors leading-tight">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500 shrink-0 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed italic">
                      {product.subtitle || product.description}
                    </p>

                    {/* Scent Pyramid preview chips */}
                    <div className="mt-3 pt-2 border-t border-[#E8E2D9]/60 dark:border-[#2E2A27]/60">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Ноты букета:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.pyramid.topNotes.slice(0, 2).map((note) => (
                          <span
                            key={note}
                            className="px-2 py-0.5 rounded-md bg-[#F4EFEA] dark:bg-[#24201D] text-[11px] text-stone-700 dark:text-stone-300"
                          >
                            {note}
                          </span>
                        ))}
                        {product.pyramid.heartNotes.slice(0, 1).map((note) => (
                          <span
                            key={note}
                            className="px-2 py-0.5 rounded-md bg-[#F4EFEA] dark:bg-[#24201D] text-[11px] text-stone-700 dark:text-stone-300"
                          >
                            {note}
                          </span>
                        ))}
                        {product.pyramid.baseNotes.length > 0 && (
                          <span className="text-[10px] text-stone-400 self-center">
                            +{product.pyramid.baseNotes.length} нот
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Volume Variants & Stock */}
                  <div className="mt-4 pt-3 border-t border-[#E8E2D9] dark:border-[#2E2A27]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-stone-400">Объемы:</span>
                      <span className="font-medium text-stone-600 dark:text-stone-300">
                        Остаток: {totalStock} шт.
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {product.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[11px]"
                        >
                          <span className="font-medium text-stone-800 dark:text-stone-200">{v.volume}</span>
                          <span className="text-stone-400">({v.stock} шт)</span>
                        </div>
                      ))}
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] uppercase text-stone-400 block">Базовая цена</span>
                        <span className="font-serif font-cormorant text-xl font-bold text-[#B8683D]">
                          от {product.basePrice.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDuplicateProduct(product, e)}
                          title="Создать копию аромата"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-[#F4EFEA] dark:hover:bg-[#24201D] transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleOpenEditModal(product, e)}
                          title="Редактировать товар"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-[#B8683D] hover:bg-[#B8683D]/10 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteProduct(product.id, product.title, e)}
                          title="Удалить аромат"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F4EFEA] dark:bg-[#24201D] border-b border-[#E8E2D9] dark:border-[#2E2A27] text-xs uppercase text-stone-500 dark:text-stone-400 tracking-wider font-medium">
                <tr>
                  <th className="py-3.5 px-4">Аромат / Фото</th>
                  <th className="py-3.5 px-4">Категория</th>
                  <th className="py-3.5 px-4">Пирамида нот</th>
                  <th className="py-3.5 px-4">Варианты и склад</th>
                  <th className="py-3.5 px-4">Базовая цена</th>
                  <th className="py-3.5 px-4">Маркетинг</th>
                  <th className="py-3.5 px-4 text-center">Витрина</th>
                  <th className="py-3.5 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9] dark:divide-[#2E2A27]">
                {filteredProducts.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

                  return (
                    <tr
                      key={product.id}
                      onClick={() => handleOpenEditModal(product)}
                      className="hover:bg-[#FBF9F5] dark:hover:bg-[#24201D]/50 transition-colors cursor-pointer"
                    >
                      {/* Photo & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || PRESET_IMAGES[0]}
                            alt={product.title}
                            className="w-12 h-12 rounded-xl object-cover border border-[#E8E2D9] dark:border-[#2E2A27] shrink-0"
                          />
                          <div>
                            <div className="font-serif font-cormorant text-base font-semibold text-stone-900 dark:text-stone-100 hover:text-[#B8683D] transition-colors">
                              {product.title}
                            </div>
                            <div className="text-xs text-stone-400 font-mono">
                              /{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4EFEA] dark:bg-[#24201D] text-stone-700 dark:text-stone-300">
                          {product.category === 'candles'
                            ? 'Свечи'
                            : product.category === 'diffusers'
                            ? 'Диффузоры'
                            : product.category === 'sachets'
                            ? 'Саше'
                            : 'Наборы'}
                        </span>
                      </td>

                      {/* Notes summary */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-xs text-stone-600 dark:text-stone-400 truncate">
                          <span className="font-medium text-stone-800 dark:text-stone-200">Топ:</span>{' '}
                          {product.pyramid.topNotes.slice(0, 2).join(', ')}
                        </div>
                        <div className="text-xs text-stone-500 truncate">
                          <span className="font-medium text-stone-800 dark:text-stone-200">База:</span>{' '}
                          {product.pyramid.baseNotes.slice(0, 2).join(', ')}
                        </div>
                      </td>

                      {/* Variants & Stock */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            {product.variants.map((v) => (
                              <span
                                key={v.id}
                                className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[11px] font-medium text-stone-700 dark:text-stone-300"
                              >
                                {v.volume}: {v.stock} шт
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] text-stone-400">Всего: {totalStock} шт.</span>
                        </div>
                      </td>

                      {/* Base Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-serif font-cormorant text-lg font-bold text-[#B8683D]">
                        от {product.basePrice.toLocaleString('ru-RU')} ₽
                      </td>

                      {/* Marketing Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {product.marketingBadge ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#B8683D]/10 text-[#B8683D] border border-[#B8683D]/20">
                            {product.marketingBadge}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </td>

                      {/* Quick Toggle Active Switch */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleToggleActive(product.id, e)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            product.isActive ? 'bg-[#B8683D]' : 'bg-stone-300 dark:bg-stone-700'
                          }`}
                          title={product.isActive ? 'Скрыть товар' : 'Опубликовать товар'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              product.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDuplicateProduct(product, e)}
                            title="Копировать"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-[#F4EFEA] dark:hover:bg-[#24201D]"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleOpenEditModal(product, e)}
                            title="Редактировать"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-[#B8683D] hover:bg-[#B8683D]/10"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProduct(product.id, product.title, e)}
                            title="Удалить"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#1C1917] rounded-3xl border border-[#E8E2D9] dark:border-[#2E2A27] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#E8E2D9] dark:border-[#2E2A27] flex items-center justify-between bg-[#FBF9F5] dark:bg-[#24201D]/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B8683D]/10 text-[#B8683D] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-cormorant text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {editingProduct ? `Редактирование: ${editingProduct.title}` : 'Новый аромат в коллекции'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Атмосферный профиль, ольфакторная пирамида и конфигурация объемов
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-[#F4EFEA] dark:hover:bg-[#24201D] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveProduct} className="overflow-y-auto flex-1 p-6 space-y-8">
              {/* SECTION 1: Основные сведения */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D9] dark:border-[#2E2A27]">
                  <Tag className="w-4 h-4 text-[#B8683D]" />
                  <h3 className="font-serif font-cormorant text-lg font-bold text-stone-800 dark:text-stone-200">
                    1. Основная информация
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                      Название аромата *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Табак и Ваниль"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                      URL Slug
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="tobacco-vanilla"
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }))}
                        className="px-3 py-2.5 rounded-xl bg-[#F4EFEA] dark:bg-[#24201D] text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-[#E8E2D9] transition-colors whitespace-nowrap"
                        title="Сгенерировать из названия"
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                      Категория товара
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value as 'candles' | 'diffusers' | 'sachets' | 'sets'
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                    >
                      <option value="candles">Ароматические свечи</option>
                      <option value="diffusers">Интерьерные диффузоры</option>
                      <option value="sachets">Флорентийские саше</option>
                      <option value="sets">Подарочные наборы</option>
                    </select>
                  </div>

                  {/* Marketing Badge */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                      Маркетинговый бейдж
                    </label>
                    <select
                      value={formData.marketingBadge}
                      onChange={(e) => setFormData((prev) => ({ ...prev, marketingBadge: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                    >
                      <option value="">Без бейджа</option>
                      {MARKETING_BADGES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                      Базовая цена (₽) *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={formData.basePrice}
                      onChange={(e) => {
                        const base = Number(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          basePrice: base,
                          variants: prev.variants.map((v) => ({
                            ...v,
                            finalPrice: base + v.priceDelta
                          }))
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm font-semibold text-[#B8683D] focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                    />
                  </div>

                  {/* Active in Storefront Toggle */}
                  <div className="flex items-center gap-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        formData.isActive ? 'bg-[#B8683D]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formData.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div>
                      <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                        {formData.isActive ? 'Опубликован в витрине' : 'Скрыт от покупателей'}
                      </span>
                      <p className="text-xs text-stone-400">
                        Управляет мгновенной видимостью в Telegram WebApp и каталоге
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Краткий дескриптор (подзаголовок)
                  </label>
                  <input
                    type="text"
                    placeholder="Кубинский табачный лист, пряная корица и абсолют бурбонской ванили"
                    value={formData.subtitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5">
                    Полное атмосферное описание
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Подробное описание звучания аромата, настроения и рекомендаций по использованию..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40 resize-y"
                  />
                </div>
              </div>

              {/* SECTION 2: Медиа Галерея */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D9] dark:border-[#2E2A27]">
                  <ImageIcon className="w-4 h-4 text-[#B8683D]" />
                  <h3 className="font-serif font-cormorant text-lg font-bold text-stone-800 dark:text-stone-200">
                    2. Фотогалерея товара
                  </h3>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {formData.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-[#E8E2D9] dark:border-[#2E2A27] bg-[#F4EFEA] dark:bg-[#24201D]"
                    >
                      <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                      {/* Main image badge */}
                      {idx === 0 ? (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#B8683D] text-white text-[10px] font-semibold flex items-center gap-1 shadow">
                          <Star className="w-3 h-3 fill-white" />
                          <span>Главная</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(idx)}
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/70 hover:bg-[#B8683D] text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Сделать главной
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1 rounded-md bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                        title="Удалить фото"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Image input card */}
                  <div className="flex flex-col justify-center items-center p-3 rounded-2xl border-2 border-dashed border-[#E8E2D9] dark:border-[#2E2A27] bg-[#FBF9F5] dark:bg-[#24201D] text-center aspect-square">
                    <ImageIcon className="w-6 h-6 text-stone-400 mb-1" />
                    <span className="text-[11px] text-stone-500 font-medium">Добавить фото</span>
                  </div>
                </div>

                {/* Add image URL bar + Presets */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="Вставьте прямую ссылку на фото (https://...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#B8683D]/40"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage(newImageUrl)}
                    className="px-4 py-2 rounded-xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold hover:bg-stone-900 transition-all"
                  >
                    + Добавить URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPreset = PRESET_IMAGES[Math.floor(Math.random() * PRESET_IMAGES.length)];
                      handleAddImage(randomPreset);
                    }}
                    className="px-4 py-2 rounded-xl border border-[#B8683D]/30 text-[#B8683D] text-xs font-semibold hover:bg-[#B8683D]/10 transition-all"
                  >
                    Случайный пресет
                  </button>
                </div>
              </div>

              {/* SECTION 3: Ольфакторная Пирамида */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9] dark:border-[#2E2A27]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B8683D]" />
                    <h3 className="font-serif font-cormorant text-lg font-bold text-stone-800 dark:text-stone-200">
                      3. Ольфакторная пирамида аромата
                    </h3>
                  </div>
                  <span className="text-xs text-stone-400">Нажмите Enter или выберите из пресетов</span>
                </div>

                {/* 3 levels of Pyramid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* TOP NOTES */}
                  <div className="p-4 rounded-2xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#B8683D]">
                          Верхние ноты
                        </span>
                        <span className="text-[10px] text-stone-400">Первые 15 мин.</span>
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1.5 min-h-[44px] mb-3">
                        {formData.pyramid.topNotes.map((note, idx) => (
                          <span
                            key={note}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-[#E8E2D9] dark:border-[#2E2A27] text-xs text-stone-800 dark:text-stone-200 font-medium shadow-sm"
                          >
                            <span>{note}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNote('top', idx)}
                              className="text-stone-400 hover:text-rose-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <input
                          type="text"
                          placeholder="Нота + Enter..."
                          value={topNoteInput}
                          onChange={(e) => setTopNoteInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNote('top', topNoteInput);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#B8683D]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddNote('top', topNoteInput)}
                          className="p-1.5 rounded-lg bg-[#B8683D] text-white hover:bg-[#A0552D]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Suggestions */}
                      <div className="flex flex-wrap gap-1">
                        {PYRAMID_SUGGESTIONS.top.slice(0, 4).map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleAddNote('top', sug)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-[#B8683D]/20 hover:text-[#B8683D]"
                          >
                            +{sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* HEART NOTES */}
                  <div className="p-4 rounded-2xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#B8683D]">
                          Ноты сердца
                        </span>
                        <span className="text-[10px] text-stone-400">Характер аромата</span>
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1.5 min-h-[44px] mb-3">
                        {formData.pyramid.heartNotes.map((note, idx) => (
                          <span
                            key={note}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-[#E8E2D9] dark:border-[#2E2A27] text-xs text-stone-800 dark:text-stone-200 font-medium shadow-sm"
                          >
                            <span>{note}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNote('heart', idx)}
                              className="text-stone-400 hover:text-rose-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <input
                          type="text"
                          placeholder="Нота + Enter..."
                          value={heartNoteInput}
                          onChange={(e) => setHeartNoteInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNote('heart', heartNoteInput);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#B8683D]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddNote('heart', heartNoteInput)}
                          className="p-1.5 rounded-lg bg-[#B8683D] text-white hover:bg-[#A0552D]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Suggestions */}
                      <div className="flex flex-wrap gap-1">
                        {PYRAMID_SUGGESTIONS.heart.slice(0, 4).map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleAddNote('heart', sug)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-[#B8683D]/20 hover:text-[#B8683D]"
                          >
                            +{sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BASE NOTES */}
                  <div className="p-4 rounded-2xl bg-[#FBF9F5] dark:bg-[#24201D] border border-[#E8E2D9] dark:border-[#2E2A27] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#B8683D]">
                          Базовые ноты
                        </span>
                        <span className="text-[10px] text-stone-400">Стойкий шлейф</span>
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1.5 min-h-[44px] mb-3">
                        {formData.pyramid.baseNotes.map((note, idx) => (
                          <span
                            key={note}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-[#E8E2D9] dark:border-[#2E2A27] text-xs text-stone-800 dark:text-stone-200 font-medium shadow-sm"
                          >
                            <span>{note}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNote('base', idx)}
                              className="text-stone-400 hover:text-rose-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <input
                          type="text"
                          placeholder="Нота + Enter..."
                          value={baseNoteInput}
                          onChange={(e) => setBaseNoteInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNote('base', baseNoteInput);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1C1917] border border-[#E8E2D9] dark:border-[#2E2A27] text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#B8683D]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddNote('base', baseNoteInput)}
                          className="p-1.5 rounded-lg bg-[#B8683D] text-white hover:bg-[#A0552D]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Suggestions */}
                      <div className="flex flex-wrap gap-1">
                        {PYRAMID_SUGGESTIONS.base.slice(0, 4).map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => handleAddNote('base', sug)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-[#B8683D]/20 hover:text-[#B8683D]"
                          >
                            +{sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Варианты объема и Склад */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9] dark:border-[#2E2A27]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#B8683D]" />
                    <h3 className="font-serif font-cormorant text-lg font-bold text-stone-800 dark:text-stone-200">
                      4. Варианты объема, цены и складские остатки
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B8683D]/10 hover:bg-[#B8683D]/20 text-[#B8683D] text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить объем</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#E8E2D9] dark:border-[#2E2A27]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4EFEA] dark:bg-[#24201D] text-stone-500 uppercase tracking-wider font-semibold border-b border-[#E8E2D9] dark:border-[#2E2A27]">
                      <tr>
                        <th className="py-2.5 px-3">Объем</th>
                        <th className="py-2.5 px-3">Дельта к цене</th>
                        <th className="py-2.5 px-3">Итоговая цена</th>
                        <th className="py-2.5 px-3">Время горения</th>
                        <th className="py-2.5 px-3">Остаток (шт)</th>
                        <th className="py-2.5 px-3">Себестоимость</th>
                        <th className="py-2.5 px-3 text-center">Удалить</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D9] dark:divide-[#2E2A27] bg-white dark:bg-[#1C1917]">
                      {formData.variants.map((variant, vIdx) => (
                        <tr key={variant.id}>
                          {/* Volume */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={variant.volume}
                              onChange={(e) => handleVariantChange(vIdx, 'volume', e.target.value)}
                              placeholder="100 мл"
                              className="w-24 px-2 py-1 rounded bg-[#FBF9F5] dark:bg-[#24201D] border border-stone-200 dark:border-stone-800 font-medium"
                            />
                          </td>

                          {/* Price Delta */}
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span className="text-stone-400">+</span>
                              <input
                                type="number"
                                value={variant.priceDelta}
                                onChange={(e) =>
                                  handleVariantChange(vIdx, 'priceDelta', Number(e.target.value))
                                }
                                placeholder="0"
                                className="w-20 px-2 py-1 rounded bg-[#FBF9F5] dark:bg-[#24201D] border border-stone-200 dark:border-stone-800"
                              />
                              <span className="text-stone-400">₽</span>
                            </div>
                          </td>

                          {/* Final Price */}
                          <td className="p-2 font-serif font-cormorant text-base font-bold text-[#B8683D]">
                            {variant.finalPrice.toLocaleString('ru-RU')} ₽
                          </td>

                          {/* Burn Time */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={variant.burnTime}
                              onChange={(e) => handleVariantChange(vIdx, 'burnTime', e.target.value)}
                              placeholder="до 25 часов"
                              className="w-28 px-2 py-1 rounded bg-[#FBF9F5] dark:bg-[#24201D] border border-stone-200 dark:border-stone-800"
                            />
                          </td>

                          {/* Stock */}
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              value={variant.stock}
                              onChange={(e) =>
                                handleVariantChange(vIdx, 'stock', Number(e.target.value))
                              }
                              className={`w-16 px-2 py-1 rounded border font-semibold ${
                                variant.stock < 5
                                  ? 'bg-rose-50 text-rose-600 border-rose-300'
                                  : 'bg-[#FBF9F5] dark:bg-[#24201D] border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200'
                              }`}
                            />
                          </td>

                          {/* Cost Price */}
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={variant.costPrice}
                                onChange={(e) =>
                                  handleVariantChange(vIdx, 'costPrice', Number(e.target.value))
                                }
                                className="w-20 px-2 py-1 rounded bg-[#FBF9F5] dark:bg-[#24201D] border border-stone-200 dark:border-stone-800"
                              />
                              <span className="text-stone-400">₽</span>
                            </div>
                          </td>

                          {/* Delete row */}
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(vIdx)}
                              className="p-1 rounded text-stone-400 hover:text-rose-600"
                              title="Удалить строку варианта"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: Опции фитиля (для свечей) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D9] dark:border-[#2E2A27]">
                  <Flame className="w-4 h-4 text-[#B8683D]" />
                  <h3 className="font-serif font-cormorant text-lg font-bold text-stone-800 dark:text-stone-200">
                    5. Опции фитиля для свечей
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Wooden Wick */}
                  <label
                    onClick={() => handleToggleWick('wooden')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.wickOptions.includes('wooden')
                        ? 'bg-[#B8683D]/10 border-[#B8683D] text-stone-900 dark:text-stone-100'
                        : 'bg-[#FBF9F5] dark:bg-[#24201D] border-[#E8E2D9] dark:border-[#2E2A27] text-stone-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        formData.wickOptions.includes('wooden')
                          ? 'bg-[#B8683D] border-[#B8683D] text-white'
                          : 'border-stone-400'
                      }`}
                    >
                      {formData.wickOptions.includes('wooden') && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-stone-900 dark:text-stone-100">
                        Деревянный фитиль (Cherry Wood)
                      </span>
                      <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                        Мягкое потрескивание при горении, эффект живого камина
                      </p>
                    </div>
                  </label>

                  {/* Cotton Wick */}
                  <label
                    onClick={() => handleToggleWick('cotton')}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.wickOptions.includes('cotton')
                        ? 'bg-[#B8683D]/10 border-[#B8683D] text-stone-900 dark:text-stone-100'
                        : 'bg-[#FBF9F5] dark:bg-[#24201D] border-[#E8E2D9] dark:border-[#2E2A27] text-stone-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        formData.wickOptions.includes('cotton')
                          ? 'bg-[#B8683D] border-[#B8683D] text-white'
                          : 'border-stone-400'
                      }`}
                    >
                      {formData.wickOptions.includes('cotton') && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-stone-900 dark:text-stone-100">
                        Хлопковый фитиль (Organic Cotton)
                      </span>
                      <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                        Классическое бесшумное ровное пламя без копоти
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#E8E2D9] dark:border-[#2E2A27] flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#1C1917] py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-wider hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-[#B8683D] hover:bg-[#A0552D] text-white text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                >
                  {editingProduct ? 'Сохранить изменения' : 'Создать аромат'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
