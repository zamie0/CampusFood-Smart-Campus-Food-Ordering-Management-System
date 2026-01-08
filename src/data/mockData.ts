export interface Vendor {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  image: string;
  cuisine: string;
  deliveryTime: string;
  isOpen: boolean;
}

export interface FoodItem {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface Order {
  id: string;
  vendorName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'completed' | 'cancelled';
  orderTime: string;
  estimatedReady?: string;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  vendorName: string;
}

// Empty arrays - data now comes from vendor registration and menu creation
export const vendors: Vendor[] = [];

export const foodItems: FoodItem[] = [];

export const currentOrders: Order[] = [];

export const orderHistory: Order[] = [];

export const notifications = [
  {
    id: 'n1',
    type: 'order',
    title: 'Welcome!',
    message: 'Start ordering from your favorite campus vendors.',
    time: 'Just now',
    isRead: false,
  },
];
