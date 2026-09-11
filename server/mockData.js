// Static category chips used by the marketplace UI.
// (Live categories come from the `category` tRPC router; the old in-memory
// mock DB was deleted after the MongoDB integration.)
export const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '🛒' },
  { id: 'Electronics', label: 'Electronics', icon: '📱' },
  { id: 'Vehicles', label: 'Vehicles', icon: '🚗' },
  { id: 'Property', label: 'Property', icon: '🏠' },
  { id: 'Fashion', label: 'Fashion', icon: '👗' },
  { id: 'Sports', label: 'Sports', icon: '⚽' },
  { id: 'Furniture', label: 'Furniture', icon: '🛋️' },
  { id: 'Books', label: 'Books', icon: '📚' },
  { id: 'Other', label: 'Other', icon: '📦' },
];
