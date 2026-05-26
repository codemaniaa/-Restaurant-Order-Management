export const mockCategories = [
  { id: 1, name: "Starters" },
  { id: 2, name: "Mains" },
  { id: 3, name: "Desserts" },
  { id: 4, name: "Drinks" },
];

export const mockMenuItems = [
  { id: 1, name: "Garlic Bread", category: "Starters", category_id: 1, description: "Toasted with garlic butter and fresh herbs", price: 3.50, is_available: true, image: null },
  { id: 2, name: "Caesar Salad", category: "Starters", category_id: 1, description: "Classic Caesar with croutons and parmesan", price: 6.00, is_available: true, image: null },
  { id: 3, name: "Grilled Chicken", category: "Mains", category_id: 2, description: "Herb-marinated chicken breast with seasonal veg", price: 14.99, is_available: true, image: null },
  { id: 4, name: "Beef Burger", category: "Mains", category_id: 2, description: "8oz premium patty with truffle fries", price: 12.50, is_available: false, image: null },
  { id: 5, name: "Pasta Carbonara", category: "Mains", category_id: 2, description: "Creamy bacon pasta with pecorino", price: 11.00, is_available: true, image: null },
  { id: 6, name: "Tiramisu", category: "Desserts", category_id: 3, description: "Classic Italian dessert", price: 6.50, is_available: true, image: null },
  { id: 7, name: "Lemonade", category: "Drinks", category_id: 4, description: "Fresh squeezed with mint", price: 2.50, is_available: true, image: null },
  { id: 8, name: "Sparkling Water", category: "Drinks", category_id: 4, description: "500ml imported sparkling", price: 1.50, is_available: true, image: null },
  { id: 9, name: "Chocolate Fondant", category: "Desserts", category_id: 3, description: "Warm chocolate cake with vanilla ice cream", price: 7.00, is_available: true, image: null },
  { id: 10, name: "Truffle Risotto", category: "Mains", category_id: 2, description: "Arborio rice with black truffle shavings", price: 16.00, is_available: true, image: null },
];

export const mockOrders = [
  {
    id: 1, customer_name: "James Wilson", customer_phone: "555-0101", notes: "No onions please",
    status: "delivered", payment_status: "paid", total_price: 28.99,
    created_at: "2024-01-15T12:30:00Z", completed_at: "2024-01-15T13:10:00Z",
    created_by_name: "admin", delivered_by_name: "chef",
    items: [
      { id: 1, menu_item: { name: "Grilled Chicken", price: 14.99 }, quantity: 1, unit_price: 14.99, subtotal: 14.99 },
      { id: 2, menu_item: { name: "Caesar Salad", price: 6.00 }, quantity: 2, unit_price: 6.00, subtotal: 12.00 },
    ],
    status_history: [
      { old_status: "", new_status: "pending", changed_by_name: "admin", changed_at: "2024-01-15T12:30:00Z" },
      { old_status: "pending", new_status: "confirmed", changed_by_name: "admin", changed_at: "2024-01-15T12:32:00Z" },
      { old_status: "confirmed", new_status: "preparing", changed_by_name: "chef", changed_at: "2024-01-15T12:40:00Z" },
      { old_status: "preparing", new_status: "ready", changed_by_name: "chef", changed_at: "2024-01-15T13:00:00Z" },
      { old_status: "ready", new_status: "delivered", changed_by_name: "chef", changed_at: "2024-01-15T13:10:00Z" },
    ],
  },
  {
    id: 2, customer_name: "Sarah Chen", customer_phone: "555-0202", notes: "",
    status: "preparing", payment_status: "unpaid", total_price: 35.50,
    created_at: "2024-01-15T13:00:00Z", completed_at: null,
    created_by_name: "admin", delivered_by_name: null,
    items: [
      { id: 3, menu_item: { name: "Truffle Risotto", price: 16.00 }, quantity: 2, unit_price: 16.00, subtotal: 32.00 },
      { id: 4, menu_item: { name: "Sparkling Water", price: 1.50 }, quantity: 1, unit_price: 1.50, subtotal: 1.50 },
    ],
    status_history: [],
  },
  {
    id: 3, customer_name: "Mike Torres", customer_phone: "555-0303", notes: "Allergy: nuts",
    status: "confirmed", payment_status: "unpaid", total_price: 21.00,
    created_at: "2024-01-15T13:15:00Z", completed_at: null,
    created_by_name: "admin", delivered_by_name: null,
    items: [
      { id: 5, menu_item: { name: "Pasta Carbonara", price: 11.00 }, quantity: 1, unit_price: 11.00, subtotal: 11.00 },
      { id: 6, menu_item: { name: "Garlic Bread", price: 3.50 }, quantity: 2, unit_price: 3.50, subtotal: 7.00 },
      { id: 7, menu_item: { name: "Lemonade", price: 2.50 }, quantity: 1, unit_price: 2.50, subtotal: 2.50 },
    ],
    status_history: [],
  },
  {
    id: 4, customer_name: "Emma Davis", customer_phone: "555-0404", notes: "",
    status: "pending", payment_status: "unpaid", total_price: 19.49,
    created_at: "2024-01-15T13:30:00Z", completed_at: null,
    created_by_name: "admin", delivered_by_name: null,
    items: [
      { id: 8, menu_item: { name: "Beef Burger", price: 12.50 }, quantity: 1, unit_price: 12.50, subtotal: 12.50 },
      { id: 9, menu_item: { name: "Tiramisu", price: 6.50 }, quantity: 1, unit_price: 6.50, subtotal: 6.50 },
    ],
    status_history: [],
  },
  {
    id: 5, customer_name: "Liam Park", customer_phone: "555-0505", notes: "Birthday table",
    status: "ready", payment_status: "partially_paid", total_price: 46.00,
    created_at: "2024-01-15T12:45:00Z", completed_at: null,
    created_by_name: "admin", delivered_by_name: null,
    items: [
      { id: 10, menu_item: { name: "Truffle Risotto", price: 16.00 }, quantity: 1, unit_price: 16.00, subtotal: 16.00 },
      { id: 11, menu_item: { name: "Grilled Chicken", price: 14.99 }, quantity: 1, unit_price: 14.99, subtotal: 14.99 },
      { id: 12, menu_item: { name: "Chocolate Fondant", price: 7.00 }, quantity: 2, unit_price: 7.00, subtotal: 14.00 },
    ],
    status_history: [],
  },
  {
    id: 6, customer_name: "Olivia Brown", customer_phone: "555-0606", notes: "",
    status: "delivered", payment_status: "paid", total_price: 17.49,
    created_at: "2024-01-15T11:00:00Z", completed_at: "2024-01-15T11:45:00Z",
    created_by_name: "admin", delivered_by_name: "chef",
    items: [
      { id: 13, menu_item: { name: "Caesar Salad", price: 6.00 }, quantity: 1, unit_price: 6.00, subtotal: 6.00 },
      { id: 14, menu_item: { name: "Pasta Carbonara", price: 11.00 }, quantity: 1, unit_price: 11.00, subtotal: 11.00 },
    ],
    status_history: [],
  },
  {
    id: 7, customer_name: "Noah Kim", customer_phone: "555-0707", notes: "Spicy preferred",
    status: "delivered", payment_status: "unpaid", total_price: 22.50,
    created_at: "2024-01-15T10:00:00Z", completed_at: "2024-01-15T10:50:00Z",
    created_by_name: "admin", delivered_by_name: "chef",
    items: [
      { id: 15, menu_item: { name: "Beef Burger", price: 12.50 }, quantity: 1, unit_price: 12.50, subtotal: 12.50 },
      { id: 16, menu_item: { name: "Garlic Bread", price: 3.50 }, quantity: 1, unit_price: 3.50, subtotal: 3.50 },
      { id: 17, menu_item: { name: "Lemonade", price: 2.50 }, quantity: 2, unit_price: 2.50, subtotal: 5.00 },
    ],
    status_history: [],
  },
];

export const mockStats = {
  total_orders: 47,
  pending_orders: 5,
  preparing_orders: 8,
  delivered_orders: 31,
  total_revenue: 1842.60,
  payment_pending: 312.40,
};

export const mockRevenueData = [
  { day: "Mon", revenue: 245 },
  { day: "Tue", revenue: 312 },
  { day: "Wed", revenue: 198 },
  { day: "Thu", revenue: 420 },
  { day: "Fri", revenue: 380 },
  { day: "Sat", revenue: 510 },
  { day: "Sun", revenue: 290 },
];
