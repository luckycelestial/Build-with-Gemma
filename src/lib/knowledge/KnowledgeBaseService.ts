export interface KnowledgeItemData {
  id: string;
  category: 'SOP' | 'PricingRule' | 'SupplierPolicy' | 'ManufacturingProcedure';
  title: string;
  content: string;
  tags: string[];
}

class KnowledgeBaseServiceClass {
  private knowledgeItems: KnowledgeItemData[] = [
    {
      id: 'sop-001',
      category: 'SOP',
      title: 'Raw Material Cost Inflation Pass-Through Policy',
      content: 'When raw steel/aluminum index rises by >3% in Peenya cluster, initiate a raw material surcharge recommendation (+3.2% to +4.8%) on active job work contracts within 7 days.',
      tags: ['pricing', 'steel', 'surcharge', 'margin']
    },
    {
      id: 'sop-002',
      category: 'SupplierPolicy',
      title: 'Tooling Consumables Safety Stock Minimums',
      content: 'Maintain a minimum threshold of 5 units for solid carbide end mills (12mm) and 100 kg for steel billets (EN8). Trigger automated RFQ when stock touches threshold.',
      tags: ['inventory', 'rfq', 'tooling', 'min_threshold']
    },
    {
      id: 'sop-003',
      category: 'PricingRule',
      title: 'Accounts Receivable Overdue Terms & Credit Hold',
      content: 'Client accounts exceeding 30 days payment delay require a 30% advance deposit on new purchase orders. Collection reminders should be sent at 7-day intervals.',
      tags: ['collections', 'ar', 'credit_limit', 'deposit']
    }
  ];

  public getAllKnowledgeItems(): KnowledgeItemData[] {
    return [...this.knowledgeItems];
  }

  public queryKnowledge(topic: string): KnowledgeItemData[] {
    const q = topic.toLowerCase();
    return this.knowledgeItems.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }
}

export const KnowledgeBaseService = new KnowledgeBaseServiceClass();
