import { Order, Product, StockItem, PromoCode, Review, StaffMember, DashboardKPI } from '../types/crm';

export const INITIAL_KPI: DashboardKPI = {
  revenue: 1485600,
  revenueGrowthPercent: 24.8,
  netProfit: 891400,
  ordersCount: 482,
  averageCheck: 3082,
  activeOrdersCount: 14,
  conversionRate: 4.6
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Табак и Ваниль',
    slug: 'tobacco-vanilla',
    category: 'candles',
    subtitle: 'Кубинский табачный лист, пряная корица и абсолют бурбонской ванили',
    description: 'Флагманский аромат Candela Home. Тёплый, согревающий букет с древесными обертонами создаёт медитативную атмосферу роскоши и уюта.',
    basePrice: 1890,
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1572726729437-3732efed37c1?auto=format&fit=crop&q=80&w=600'
    ],
    pyramid: {
      topNotes: ['Лист табака', 'Пряный имбирь', 'Кориандр'],
      heartNotes: ['Бобы тонка', 'Цветок табака', 'Какао', 'Сладкий мёд'],
      baseNotes: ['Бурбонская ваниль', 'Древесный аккорд', 'Сухофрукты']
    },
    variants: [
      { id: 'v1-1', volume: '100 мл', priceDelta: 0, finalPrice: 1890, burnTime: 'до 25 часов', stock: 18, costPrice: 520 },
      { id: 'v1-2', volume: '250 мл', priceDelta: 650, finalPrice: 2540, burnTime: 'до 55 часов', stock: 3, costPrice: 780 }
    ],
    wickOptions: ['wooden', 'cotton'],
    marketingBadge: 'Хит сезона',
    rating: 4.9,
    reviewsCount: 38,
    isActive: true,
    createdAt: '2026-10-10'
  },
  {
    id: 'prod-2',
    title: 'Хвоя и Можжевельник',
    slug: 'pine-juniper',
    category: 'candles',
    subtitle: 'Аромат туманного скандинавского леса после дождя с нотами смолы и мха',
    description: 'Натуральный хвойный эликсир. Очищает мысли, снимает усталость и наполняет дом свежестью вечнозеленой тайги.',
    basePrice: 1890,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600'
    ],
    pyramid: {
      topNotes: ['Эвкалипт', 'Иглы сибирской пихты', 'Озон'],
      heartNotes: ['Ягоды можжевельника', 'Кедровая смола', 'Кипарис'],
      baseNotes: ['Дубовый мох', 'Серая амбра', 'Белый кедр']
    },
    variants: [
      { id: 'v2-1', volume: '100 мл', priceDelta: 0, finalPrice: 1890, burnTime: 'до 25 часов', stock: 12, costPrice: 490 },
      { id: 'v2-2', volume: '250 мл', priceDelta: 650, finalPrice: 2540, burnTime: 'до 55 часов', stock: 8, costPrice: 750 }
    ],
    wickOptions: ['wooden', 'cotton'],
    marketingBadge: 'Масла Граса',
    rating: 4.8,
    reviewsCount: 22,
    isActive: true,
    createdAt: '2026-10-12'
  },
  {
    id: 'prod-3',
    title: 'Сандал и Кардамон',
    slug: 'sandalwood-cardamom',
    category: 'diffusers',
    subtitle: 'Шелковистый древесный диффузор с пряным ориентальным шлейфом',
    description: 'Премиальный интерьерный диффузор с фибровыми палочками. Мягкая диффузия аромата до 3 месяцев.',
    basePrice: 2390,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600'
    ],
    pyramid: {
      topNotes: ['Зеленый кардамон', 'Мускатный орех'],
      heartNotes: ['Майсурский сандал', 'Ирис', 'Фиалка'],
      baseNotes: ['Амброксан', 'Кедр', 'Кожа']
    },
    variants: [
      { id: 'v3-1', volume: '100 мл', priceDelta: 0, finalPrice: 2390, burnTime: 'стойкость 2-3 мес.', stock: 4, costPrice: 650 },
      { id: 'v3-2', volume: '200 мл', priceDelta: 800, finalPrice: 3190, burnTime: 'стойкость 4-5 мес.', stock: 2, costPrice: 940 }
    ],
    wickOptions: [],
    marketingBadge: 'Лимитированный тираж',
    rating: 5.0,
    reviewsCount: 16,
    isActive: true,
    createdAt: '2026-10-15'
  },
  {
    id: 'prod-4',
    title: 'Инжир и Розовый Перец',
    slug: 'fig-pink-pepper',
    category: 'sachets',
    subtitle: 'Ароматическое восковое саше для гардероба и бельевого комода',
    description: 'Флорентийское саше из соевого воска с лепестками сухоцветов. Дарит одежде тонкий селективный аромат.',
    basePrice: 790,
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600'
    ],
    pyramid: {
      topNotes: ['Зеленый лист инжира', 'Розовый перец'],
      heartNotes: ['Мякоть спелого инжира', 'Кокосовое молочко'],
      baseNotes: ['Белый кедр', 'Мускус']
    },
    variants: [
      { id: 'v4-1', volume: '1 шт (45г)', priceDelta: 0, finalPrice: 790, burnTime: 'аромат до 60 дней', stock: 25, costPrice: 190 }
    ],
    wickOptions: [],
    marketingBadge: 'New',
    rating: 4.9,
    reviewsCount: 19,
    isActive: true,
    createdAt: '2026-10-20'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1048',
    orderNumber: 'CH-1048',
    userId: 'tg-98214',
    userName: 'Елена Васильева',
    userPhone: '+7 (916) 432-88-19',
    userTelegram: '@elena_vas',
    status: 'PAID',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productTitle: 'Табак и Ваниль',
        productImage: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=200',
        volume: '250 мл',
        wick: 'wooden',
        price: 2540,
        quantity: 1
      },
      {
        id: 'item-2',
        productId: 'prod-4',
        productTitle: 'Инжир и Розовый Перец',
        productImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=200',
        volume: '1 шт (45г)',
        price: 790,
        quantity: 2
      }
    ],
    subtotal: 4120,
    bonusDiscount: 420,
    deliveryCost: 290,
    totalAmount: 3990,
    deliveryType: 'cdek_pvz',
    deliveryAddress: 'г. Москва, ул. Малая Бронная, 22 (ПВЗ СДЭК MSK104)',
    trackingNumber: '',
    paymentGateway: 'ЮKassa (СБП)',
    paymentTransactionId: 'yk_2ea781bc09e1',
    createdAt: '2026-11-05 00:45',
    updatedAt: '2026-11-05 00:48',
    comment: 'Пожалуйста, упакуйте аккуратно, это в подарок сестре!'
  },
  {
    id: 'ord-1047',
    orderNumber: 'CH-1047',
    userId: 'tg-67123',
    userName: 'Михаил Романов',
    userPhone: '+7 (903) 771-45-90',
    userTelegram: '@misharomanov',
    status: 'PACKING',
    items: [
      {
        id: 'item-3',
        productId: 'prod-2',
        productTitle: 'Хвоя и Можжевельник',
        productImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200',
        volume: '250 мл',
        wick: 'wooden',
        price: 2540,
        quantity: 2
      }
    ],
    subtotal: 5080,
    bonusDiscount: 0,
    deliveryCost: 490,
    totalAmount: 5570,
    deliveryType: 'cdek_courier',
    deliveryAddress: 'г. Москва, Пресненская наб., д. 8, стр. 1, кв. 142',
    trackingNumber: 'CDEK-14981274',
    paymentGateway: 'ЮKassa (Банковская карта)',
    paymentTransactionId: 'yk_88fc302a4b11',
    createdAt: '2026-11-04 22:15',
    updatedAt: '2026-11-04 22:30'
  },
  {
    id: 'ord-1046',
    orderNumber: 'CH-1046',
    userId: 'tg-41908',
    userName: 'София Лебедева',
    userPhone: '+7 (921) 980-33-41',
    userTelegram: '@sofia_leb',
    status: 'SHIPPED',
    items: [
      {
        id: 'item-4',
        productId: 'prod-3',
        productTitle: 'Сандал и Кардамон',
        productImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200',
        volume: '100 мл',
        price: 2390,
        quantity: 1
      }
    ],
    subtotal: 2390,
    bonusDiscount: 200,
    deliveryCost: 250,
    totalAmount: 2440,
    deliveryType: 'pochta_russia',
    deliveryAddress: 'г. Санкт-Петербург, Невский пр-т, 140 (Отделение 191024)',
    trackingNumber: 'RU849201948CN',
    paymentGateway: 'ЮKassa (T-Pay)',
    paymentTransactionId: 'yk_10fca4988712',
    createdAt: '2026-11-04 18:20',
    updatedAt: '2026-11-04 19:05'
  },
  {
    id: 'ord-1045',
    orderNumber: 'CH-1045',
    userId: 'tg-11029',
    userName: 'Артём Кузнецов',
    userPhone: '+7 (985) 120-66-77',
    status: 'DELIVERED',
    items: [
      {
        id: 'item-5',
        productId: 'prod-1',
        productTitle: 'Табак и Ваниль',
        productImage: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=200',
        volume: '100 мл',
        wick: 'cotton',
        price: 1890,
        quantity: 1
      }
    ],
    subtotal: 1890,
    bonusDiscount: 180,
    deliveryCost: 290,
    totalAmount: 2000,
    deliveryType: 'cdek_pvz',
    deliveryAddress: 'г. Казань, ул. Баумана, 58 (ПВЗ СДЭК KZN04)',
    trackingNumber: 'CDEK-99481726',
    paymentGateway: 'ЮKassa (СБП)',
    paymentTransactionId: 'yk_9941bb48291a',
    createdAt: '2026-11-03 14:10',
    updatedAt: '2026-11-04 16:30'
  }
];

export const INITIAL_PROMOS: PromoCode[] = [
  {
    id: 'pr-1',
    code: 'CANDELAVIP',
    type: 'percent',
    discountValue: 15,
    minOrderAmount: 3000,
    usageLimit: 100,
    usedCount: 42,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    isActive: true
  },
  {
    id: 'pr-2',
    code: 'WELCOME500',
    type: 'fixed',
    discountValue: 500,
    minOrderAmount: 2500,
    usageLimit: 50,
    usedCount: 49,
    startDate: '2026-10-15',
    endDate: '2026-11-15',
    isActive: true
  },
  {
    id: 'pr-3',
    code: 'AUTUMN20',
    type: 'percent',
    discountValue: 20,
    minOrderAmount: 4000,
    usageLimit: 30,
    usedCount: 30,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    isActive: false
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productTitle: 'Табак и Ваниль',
    authorName: 'Анна М.',
    authorTelegram: '@anna_mood',
    rating: 5,
    isVerifiedPurchase: true,
    text: 'Невероятный глубокий аромат! Деревянный фитиль приятно потрескивает, словно сидишь у миниатюрного камина. Воск плавится идеально ровно, баночка выглядит очень стильно.',
    pros: 'Потрескивающий фитиль, стойкий богатый шлейф',
    cons: 'Быстро заканчивается, хочется жечь сутками!',
    attributes: {
      matchesDescription: true,
      longevity: 'Очень стойкий'
    },
    photos: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=300'
    ],
    brandReply: {
      text: 'Анна, благодарим вас за доверие! Рады, что наш потрескивающий фитиль создал в вашем доме ту самую атмосферу уюта. Рекомендуем также попробовать наш хвойный бленд.',
      repliedAt: '2026-11-04 15:40',
      authorName: 'Candela Home Care'
    },
    status: 'published',
    createdAt: '2026-11-04 12:30'
  },
  {
    id: 'rev-2',
    productId: 'prod-3',
    productTitle: 'Сандал и Кардамон',
    authorName: 'Дмитрий В.',
    authorTelegram: '@dmitry_v',
    rating: 5,
    isVerifiedPurchase: true,
    text: 'Диффузор наполнил спальню буквально за 2 часа. Запах очень благородный, не химозный, именно нишевый сандал. Обязательно закажу ещё в гостиную.',
    attributes: {
      matchesDescription: true,
      longevity: 'Стойкий'
    },
    photos: [],
    status: 'published',
    createdAt: '2026-11-03 19:15'
  },
  {
    id: 'rev-3',
    productId: 'prod-1',
    productTitle: 'Табак и Ваниль (250 мл)',
    authorName: 'Ксения К.',
    authorTelegram: '@ksenia_k',
    rating: 4,
    isVerifiedPurchase: true,
    text: 'Очень классная свеча, но доставка СДЭК задержалась на 1 день. К самому продукту и упаковке вопросов ноль, она безупречна.',
    pros: 'Аромат и дизайн',
    cons: 'Задержка доставки',
    attributes: {
      matchesDescription: true,
      longevity: 'Стойкий'
    },
    photos: [],
    status: 'pending',
    createdAt: '2026-11-05 01:10'
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'st-1',
    telegramId: '109283741',
    telegramUsername: '@candela_owner',
    name: 'Александр (Основатель)',
    role: 'OWNER',
    addedAt: '2026-09-01',
    lastActive: 'Сейчас',
    isActive: true
  },
  {
    id: 'st-2',
    telegramId: '298374812',
    telegramUsername: '@marina_manager',
    name: 'Марина (Управляющая)',
    role: 'ADMIN',
    addedAt: '2026-09-15',
    lastActive: '12 минут назад',
    isActive: true
  },
  {
    id: 'st-3',
    telegramId: '847291039',
    telegramUsername: '@ivan_pack',
    name: 'Иван (Склад & Логистика)',
    role: 'MANAGER',
    addedAt: '2026-10-01',
    lastActive: '1 час назад',
    isActive: true
  },
  {
    id: 'st-4',
    telegramId: '992817264',
    telegramUsername: '@polina_content',
    name: 'Полина (Контент & Отзывы)',
    role: 'EDITOR',
    addedAt: '2026-10-10',
    lastActive: 'Вчера, 18:40',
    isActive: true
  }
];
