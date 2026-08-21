import { Order } from "./types";

let orderChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined") {
  try {
    orderChannel = new BroadcastChannel("hotel_qr_orders_channel");
  } catch (err) {
    console.warn("BroadcastChannel not supported in this environment", err);
  }
}

export function dispatchNewOrder(order: Order) {
  if (orderChannel) {
    orderChannel.postMessage({ type: "NEW_ORDER", order });
  }
  // Also dispatch a local CustomEvent for state listeners in the same window
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("new-order-local", { detail: order }));
  }
}

export function registerOrderListener(callback: (order: Order) => void) {
  if (typeof window === "undefined") return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === "NEW_ORDER") {
      callback(event.data.order);
    }
  };

  const handleLocal = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  if (orderChannel) {
    orderChannel.addEventListener("message", handleMessage);
  }
  window.addEventListener("new-order-local", handleLocal);

  return () => {
    if (orderChannel) {
      orderChannel.removeEventListener("message", handleMessage);
    }
    window.removeEventListener("new-order-local", handleLocal);
  };
}
