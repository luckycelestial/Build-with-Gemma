# Customer Intelligence Department Module

## 📌 Purpose
Monitors customer revenue concentration, credit policy compliance, and payment delay risk matrices to safeguard SME revenue stability.

## 🛠️ Key Responsibilities
- **Revenue Concentration Analysis**: Identifying single-customer revenue dependencies (>30% revenue share).
- **Payment Risk Scoring**: Rating customer payment risk profiles based on historical payment performance.
- **Credit Policy Enforcement**: Recommending advance deposit requirements for high-risk customer accounts.

## 📄 Submodule Architecture
- `components/`: Customer concentration pie chart, risk rating table, credit policy badges.
- `services/`: `CustomerRiskService`, `CreditPolicyService`.
- `agent/`: `CustomerSuccessWorker` manager agent.
- `types/`: `CustomerProfile`, `ConcentrationMetric`, `CreditPolicy` types.
- `tests/`: Department tests for customer risk calculations.

## 🚀 Future Roadmap
- Automated credit limit adjustments integrated directly into Tally ERP client masters.
