# Maturity Tiers

## Purpose
Define three business-user maturity levels for the Gemma-powered SME platform so the product can adapt its interface, depth, and explanations without changing the underlying Gemma reasoning core.

## Core Principle
There is only **one** product and one Gemma intelligence layer. Beginner, Intermediate, and Expert are presentation modes that control how much complexity is visible, what defaults are used, and how recommendations are explained.

## Tier 1: Beginner

### Who this is for
- Owner-operators who mostly run the business using instinct, WhatsApp, paper notes, and scattered Excel sheets.
- Users with no finance background and little patience for dashboards.
- People who want a direct answer more than analysis.

### Primary need
"Tell me what to do this week and why it matters."

### UX style
- Plainest possible language.
- Recommendation-first interface.
- Fewer numbers, fewer charts, fewer filters.
- More guided actions and suggested prompts.

### Default screens/modules
- Weekly action plan.
- Pricing recommendation cards.
- Cash flow warning alerts.
- Simple Ask Gemma chat.
- Import data wizard.

### Hide or minimize
- Advanced filters.
- Detailed tables.
- Confidence scores.
- Supply-chain node drilldowns.
- Advanced scenario controls.

### Example Gemma tone
"Steel costs rose this week. Increase the price of Product A by 3% for new orders. This protects your margin without affecting your most price-sensitive customer."

## Tier 2: Intermediate

### Who this is for
- Owners already using Excel, Tally, Zoho, or structured bookkeeping.
- Users who track some numbers and want support interpreting them faster.
- People comfortable with trends and comparisons, but not advanced analytics.

### Primary need
"Show me what changed, what it affects, and what action I should take."

### UX style
- Plain language plus supporting metrics.
- Mix of explanation cards and lightweight charts.
- Moderate control and drilldown.
- Scenario testing through presets.

### Default screens/modules
- Everything in Beginner.
- Revenue, margin, and collections trends.
- Customer-wise payment risk.
- Product-wise profitability view.
- News-impact cards.
- What-if simulator with presets.

### Hide or minimize
- Full assumption trees.
- Deep supply-chain graph exploration.
- Technical model controls.

### Example Gemma tone
"Your margin fell 2.1% this month. The main drivers were a steel cost increase and delayed payments from two repeat customers. A 3% increase on Product A should restore margin with limited risk."

## Tier 3: Expert

### Who this is for
- Highly involved operators or managers who are comfortable reading metrics and comparing scenarios.
- Businesses with somewhat structured data and repeat decision processes.
- Users who want control, detail, and traceability.

### Primary need
"Show me the assumptions, tradeoffs, and sensitivity before I decide."

### UX style
- Analytical but still plain-language.
- More visible metrics, controls, and drilldowns.
- Advanced simulator inputs.
- Clear confidence and rationale visibility.

### Default screens/modules
- Everything in Intermediate.
- Supply-chain node tracker.
- Customer segment sensitivity analysis.
- Advanced what-if simulator controls.
- Confidence score and assumption breakdown.
- Recommendation history and override log.
- Strategic demand-shift monitor.

### Hide or minimize
- Very little; experts should access nearly all modules.

### Example Gemma tone
"A 5% price increase on Product A improves projected margin by 1.8 points, but Customer Segment C shows higher churn sensitivity. If supplier delay exceeds 7 days, cash-flow stress will rise in week 3."

## Onboarding Logic
Use 3 quick onboarding questions to assign a starting tier:
1. How do you currently track your business? Notebook / Excel / software.
2. How often do you review pricing and cash flow? Rarely / monthly / weekly.
3. What do you need help with first? Pricing / cash flow / demand planning.

Gemma can suggest a default tier, but the user should be able to switch modes anytime.

## Product Rules
- Gemma remains the same core intelligence in all tiers.
- Only the interface depth, defaults, and explanation style change.
- Beginner should never feel dumbed down; it should feel focused.
- Expert should never feel cluttered; advanced detail should remain structured.
- Users should be able to grow from Beginner to Expert over time.

## Implementation Notes
- Store selected tier in the user profile.
- Use the tier to control visible widgets, default prompts, chart density, and explanation verbosity.
- Keep all recommendations grounded in the same shared data store and Gemma orchestration layer.
