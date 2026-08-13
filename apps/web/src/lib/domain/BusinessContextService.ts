export interface SharedBusinessContext {
  businessId: string;
  businessName: string;
  location: string;
  industry: string;
  currentCustomer?: { name: string; key: string; riskScore: string };
  currentSupplier?: { name: string; balance: number };
  currentPricingRecommendation?: { material: string; action: string; price: string };
  currentRevenueForecast?: { avgMonthlyLakh: number; trendPct: number };
  currentCollectionStatus?: { overdueLakh: number; overdueDays: number };
  activeWorkspace?: string;
  lastUpdated: string;
}

class BusinessContextRepository {
  private activeContext: SharedBusinessContext = {
    businessId: "biz-peenya-001",
    businessName: "Meenakshi Precision Components",
    location: "Peenya, Bengaluru",
    industry: "CNC Precision Machining",
    currentCustomer: { name: "ABC Industries", key: "abc_ind", riskScore: "High" },
    currentSupplier: { name: "Peenya Steel Stockyard", balance: 145000 },
    currentPricingRecommendation: { material: "CNC Steel Sheets", action: "Surcharge +4.8%", price: "₹68/kg" },
    currentRevenueForecast: { avgMonthlyLakh: 42, trendPct: -6 },
    currentCollectionStatus: { overdueLakh: 3.8, overdueDays: 38 },
    activeWorkspace: "/",
    lastUpdated: new Date().toISOString()
  };

  public getContext(): SharedBusinessContext {
    return { ...this.activeContext };
  }

  public updateContext(partial: Partial<SharedBusinessContext>): SharedBusinessContext {
    this.activeContext = {
      ...this.activeContext,
      ...partial,
      lastUpdated: new Date().toISOString()
    };
    return this.activeContext;
  }
}

export const BusinessContextService = new BusinessContextRepository();
