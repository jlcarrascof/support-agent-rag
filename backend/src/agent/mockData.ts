export type OrderStatus = "placed" | "preparing" | "in_transit" | "delivered";

export interface Order {
  id: string;
  status: OrderStatus;
  estimatedDeliveryMinutes: number;
  refunded: boolean;
}

export const mockOrders: Record<string, Order> = {
  "1234": { id: "1234", status: "in_transit", estimatedDeliveryMinutes: 15, refunded: false },
  "5678": { id: "5678", status: "delivered", estimatedDeliveryMinutes: 0, refunded: false },
  "9999": { id: "9999", status: "preparing", estimatedDeliveryMinutes: 35, refunded: true },
};
