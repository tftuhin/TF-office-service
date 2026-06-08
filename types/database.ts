export type Role = "user" | "staff" | "admin";
export type OrderStatus = "pending" | "completed";

export type Profile = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  created_at: string;
};

export type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  placed_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  item_id: string;
  unit_price: number;
  quantity: number;
};

/** Shape returned by the dashboard query (order + joined lines + profile email). */
export type OrderWithDetails = Order & {
  profiles: { email: string; name?: string | null } | null;
  order_items: (OrderItem & { items: Pick<Item, "name"> | null })[];
};
