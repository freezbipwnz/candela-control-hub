// Candela Control Hub — Shared Data Models & Types

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EDITOR';

export type OrderStatus = 
  | 'PENDING_PAYMENT' 
  | 'PAID' 
  | 'PACKING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';

export type DeliveryType = 'cdek_pvz' | 'cdek_courier' | 'pochta_russia' | 'self_pickup';

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  volume: string;
  wick?: 'wooden' | 'cotton';
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "CH-1048"
  userId: string;
  userName: string;
  userPhone: string;
  userTelegram?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  bonusDiscount: number;
  deliveryCost: number;
  totalAmount: number;
  deliveryType: DeliveryType;
  deliveryAddress: string;
  trackingNumber?: string;
  paymentGateway: string;
  paymentTransactionId: string;
  createdAt: string;
  updatedAt: string;
  comment?: string;
}

export interface OlfactoryPyramid {
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
}

export interface ProductVariant {
  id: string;
  volume: string; // e.g. "100 мл", "250 мл"
  priceDelta: number; // 0 for base, +650 for 250ml
  finalPrice: number;
  burnTime: string; // "до 45 часов"
  stock: number;
  costPrice: number;
}

export interface Product {
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
  marketingBadge?: string;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface StockItem {
  id: string;
  productId: string;
  productTitle: string;
  category: string;
  variantVolume: string;
  currentStock: number;
  minThreshold: number;
  costPrice: number;
  sellingPrice: number;
  lastUpdated: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  orderId?: string;
  productTitle: string;
  productId: string;
  authorName: string;
  authorTelegram: string;
  rating: number;
  isVerifiedPurchase: boolean;
  text: string;
  pros?: string;
  cons?: string;
  attributes: {
    matchesDescription: boolean;
    longevity: 'Легкий' | 'Умеренный' | 'Стойкий' | 'Очень стойкий';
  };
  photos: string[];
  brandReply?: {
    text: string;
    repliedAt: string;
    authorName: string;
  };
  status: 'published' | 'pending' | 'rejected';
  createdAt: string;
}

export interface StaffMember {
  id: string;
  telegramId: string;
  telegramUsername?: string;
  name: string;
  role: UserRole;
  addedAt: string;
  lastActive: string;
  isActive: boolean;
}

export interface DashboardKPI {
  revenue: number;
  revenueGrowthPercent: number;
  netProfit: number;
  ordersCount: number;
  averageCheck: number;
  activeOrdersCount: number;
  conversionRate: number;
}
