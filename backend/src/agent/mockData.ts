export type OrderStatus = "placed" | "preparing" | "in_transit" | "delivered";

export interface Order {
  id: string;
  status: OrderStatus;
  estimatedDeliveryMinutes: number;
  minutesLate: number;
  refunded: boolean;
}

export const mockOrders: Record<string, Order> = {
  "1234": { id: "1234", status: "in_transit", estimatedDeliveryMinutes: 15, minutesLate: 0, refunded: false },
  "4321": { id: "4321", status: "in_transit", estimatedDeliveryMinutes: 0, minutesLate: 50, refunded: false },
  "5678": { id: "5678", status: "delivered", estimatedDeliveryMinutes: 0, minutesLate: 0, refunded: false },
  "9999": { id: "9999", status: "preparing", estimatedDeliveryMinutes: 35, minutesLate: 0, refunded: true },
};

export type RideStatus = "requested" | "driver_assigned" | "in_progress" | "completed" | "cancelled";

export interface Ride {
  id: string;
  status: RideStatus;
  driverAssigned: boolean;
  minutesSinceBooking: number;
  driverLateMinutes: number;
}

export const mockRides: Record<string, Ride> = {
  "ride-1": { id: "ride-1", status: "requested", driverAssigned: false, minutesSinceBooking: 2, driverLateMinutes: 0 },
  "ride-2": { id: "ride-2", status: "driver_assigned", driverAssigned: true, minutesSinceBooking: 8, driverLateMinutes: 0 },
  "ride-3": { id: "ride-3", status: "driver_assigned", driverAssigned: true, minutesSinceBooking: 12, driverLateMinutes: 15 },
  "ride-4": { id: "ride-4", status: "in_progress", driverAssigned: true, minutesSinceBooking: 20, driverLateMinutes: 0 },
};
