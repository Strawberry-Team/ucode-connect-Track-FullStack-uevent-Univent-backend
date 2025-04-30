// src/common/events/order-events.interface.ts

export interface OrderCreatedEvent {
  orderId: number;
  userId: number;
  eventId: number;
}