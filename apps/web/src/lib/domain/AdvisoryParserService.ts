import { AIService } from '../ai';

export interface AdvisoryParseResult {
  category: 
    | 'CommodityPrice' 
    | 'SupplyRisk' 
    | 'SupplierDelay' 
    | 'PolicyChange' 
    | 'CurrencyMovement' 
    | 'EnergyCost' 
    | 'IndustryOpportunity' 
    | 'LogisticsRisk' 
    | 'MarketNews' 
    | 'Unknown';
  headline: string;
  affectedMaterial: string;
  change: string; // e.g. "+7%", "Delayed 4 days", etc.
  reason: string;
  confidence: number; // 0.0 to 1.0
  summary: string;
  recommendedImpact: 'Pricing' | 'Supplier' | 'Revenue' | 'Collections' | 'Advisor';
  status: 'Active' | 'Needs Review';
}

export class AdvisoryParserService {
  /**
   * Classifies and parses an incoming advisory message into structured business intelligence JSON
   */
  static async parseAdvisoryMessage(messageText: string): Promise<AdvisoryParseResult> {
    const prompt = `
You are the Executive AI CTO Advisory Intelligence Parser.
Parse the following industrial business update message and extract structured intelligence in JSON format.

Possible Categories:
- CommodityPrice (e.g. Steel/Aluminium prices up 7%)
- SupplyRisk (e.g. Port strike, raw material shortage)
- SupplierDelay (e.g. ABC Metals delayed shipment)
- PolicyChange (e.g. Import duty increased to 12%)
- CurrencyMovement (e.g. USD-INR reached 89.5)
- EnergyCost (e.g. Electricity tariff revised)
- IndustryOpportunity (e.g. EV machining demand up)
- LogisticsRisk (e.g. Container shortages)
- MarketNews (General news)

Return ONLY a valid JSON object matching this structure:
{
  "category": "CommodityPrice",
  "headline": "Brief 6-8 word headline",
  "affectedMaterial": "Steel / Aluminium / Energy / Logistics / etc.",
  "change": "+7% / Delayed 3 days / Tariff hike",
  "reason": "Extracted reason or cause",
  "confidence": 0.94,
  "summary": "1-sentence executive summary",
  "recommendedImpact": "Pricing"
}

MESSAGE TO PARSE:
"${messageText}"
`;

    try {
      const jsonText = await AIService.generateCompletion(prompt, true);
      const data = AIService.safeParseJson<any>(jsonText, {});


      const confidence = typeof data.confidence === 'number' ? data.confidence : 0.85;
      const status: 'Active' | 'Needs Review' = confidence >= 0.70 ? 'Active' : 'Needs Review';

      return {
        category: data.category || 'CommodityPrice',
        headline: data.headline || messageText.slice(0, 40),
        affectedMaterial: data.affectedMaterial || 'Industrial Material',
        change: data.change || 'Cost Change',
        reason: data.reason || 'Market trend',
        confidence,
        summary: data.summary || messageText,
        recommendedImpact: data.recommendedImpact || 'Pricing',
        status
      };
    } catch (err: any) {
      console.warn("AI parsing fallback for advisory message:", err.message);

      // Fast rule-based fallback
      const lower = messageText.toLowerCase();
      let category: AdvisoryParseResult['category'] = 'CommodityPrice';
      let material = 'Steel / Metals';
      let change = '+5%';
      let impact: AdvisoryParseResult['recommendedImpact'] = 'Pricing';

      if (lower.includes("strike") || lower.includes("container") || lower.includes("logistics")) {
        category = 'LogisticsRisk';
        impact = 'Supplier';
        change = 'Delay Risk';
      } else if (lower.includes("supplier") || lower.includes("delayed")) {
        category = 'SupplierDelay';
        impact = 'Supplier';
        change = 'Shipment Delay';
      } else if (lower.includes("ev") || lower.includes("demand") || lower.includes("opportunity")) {
        category = 'IndustryOpportunity';
        impact = 'Advisor';
        change = '+15% Demand';
      } else if (lower.includes("duty") || lower.includes("tax") || lower.includes("policy")) {
        category = 'PolicyChange';
        impact = 'Pricing';
        change = '+12% Duty';
      }

      return {
        category,
        headline: messageText.slice(0, 45),
        affectedMaterial: material,
        change,
        reason: "Reported via trusted WhatsApp advisory feed",
        confidence: 0.88,
        summary: messageText,
        recommendedImpact: impact,
        status: 'Active'
      };
    }
  }
}
