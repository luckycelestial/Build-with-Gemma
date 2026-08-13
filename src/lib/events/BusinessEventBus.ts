export interface BusinessEvent {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  summary: string;
  details: Record<string, any>;
  deepLink?: string;
}

type EventListener = (event: BusinessEvent) => void;

class EventBus {
  private listeners: Set<EventListener> = new Set();
  private recentEvents: BusinessEvent[] = [
    {
      id: "evt-initial-1",
      type: "InvoiceLogged",
      timestamp: "09:12 AM",
      source: "WhatsApp",
      summary: "Supplier invoice logged via WhatsApp (₹45,000 - Peenya Steel Stockyard)",
      details: { supplierName: "Peenya Steel Stockyard", amount: 45000, materialName: "CNC Steel Sheets" },
      deepLink: "/supplier-agent"
    },
    {
      id: "evt-initial-2",
      type: "MarketSignalDetected",
      timestamp: "08:30 AM",
      source: "Market Feed",
      summary: "Bengaluru Peenya cluster steel spot quotes surged +4.1%",
      details: { material: "Mild Steel", change: "+4.1%" },
      deepLink: "/pricing-agent"
    }
  ];

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public publish(event: BusinessEvent): void {
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 50) {
      this.recentEvents.pop();
    }
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in BusinessEventBus listener:", err);
      }
    });
  }

  public getEvents(): BusinessEvent[] {
    return [...this.recentEvents];
  }
}

export const BusinessEventBus = new EventBus();
