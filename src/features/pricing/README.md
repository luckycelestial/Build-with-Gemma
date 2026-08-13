# Pricing & Margin Defense Department Module

## 📌 Purpose
Protects product gross margin corridors against raw material price inflation by calculating raw material surcharge pass-through rates and updating pricing recommendations.

## 🛠️ Key Responsibilities
- **Gross Margin Corridor Defense**: Monitoring product gross margins against target thresholds (>= 16.5%).
- **BOM Surcharge Calculator**: Computing raw material inflation pass-through percentages for CNC customer quotes.
- **Tally ERP Price Updates**: Posting accepted surcharge recommendations directly to Tally ERP.
- **Structural Risk Mitigation**: Monitoring long-term single-supplier concentration risks.

## 📄 Submodule Architecture
- `components/`: Pricing recommendation cards, BOM surcharge pass-through simulator, margin corridor widgets.
- `services/`: `PricingService`, `SurchargeCalculatorService`, `StructuralRiskService`.
- `workflow/`: Gross Margin Defense & Raw Steel Surcharge DAG workflows.
- `agent/`: `PricingWorker` manager agent.
- `events/`: Handlers for `RawMaterialPriceSpiked` and `GrossMarginBreached` events.
- `types/`: `PricingRecommendation`, `Material`, `BOMSurcharge`, `StructuralRisk` types.
- `database/`: Prisma data access for `Material`, `PricingRecommendation`, and `StructuralRisk`.
- `tests/`: Department tests for surcharge calculation math.

## 🚀 Future Roadmap
- Predictive surcharge pass-through simulation based on 8-week steel index futures.
- Dynamic customer-specific pricing contracts based on order volume history.
