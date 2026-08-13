# Screen Spec: Beginner Mode

## Purpose
This screen set is for business owners who are not comfortable with dashboards, financial analysis, or deep operational tools. The goal is to give them a simple, action-first experience where Gemma behaves like a practical business advisor, not an analytics product.

Beginner mode should feel calm, guided, and confidence-building. It should never overwhelm the user with too many charts, filters, tables, or technical terms.

## Product Principle
Gemma is still the same intelligence core used across the whole platform. In Beginner mode, the difference is not the model, but the presentation:
- simpler wording
- fewer visible modules
- stronger guidance
- recommendation-first UI
- low-friction decisions

## Target User
Typical user in this mode:
- CNC or manufacturing SME owner
- Runs business with Excel, WhatsApp, paper notes, and memory
- No finance team
- No analytics background
- Wants direct answers and next steps
- Has limited time and low patience for dashboards

## Main Goal of Beginner Mode
Answer one question very clearly:

**"What should I do this week, and why?"**

## Core Screens in Beginner Mode
Beginner mode should not expose the full product at once. It should focus on a small number of high-confidence screens.

### 1. Beginner Home
This is the main screen and the most important one.

#### What it should show
- Greeting with business name
- One-line Gemma summary of the week
- Top 3 recommended actions
- Simple business health strip
- One primary CTA: Ask Gemma

#### Layout
- Header with business name and mode label: Beginner
- Weekly summary card at top
- Three action cards below
- Health strip below actions
- Sticky bottom action bar on mobile

#### Weekly summary example
"Your steel cost increased this week and two customers may pay late. Focus on adjusting prices for new orders and following up on pending payments."

#### Action card structure
Each card must contain:
- Title
- Short action statement
- Why it matters in one or two lines
- Priority badge: High / Medium / Low
- Action buttons: Accept, Ask Why, Remind Me Later

#### Example cards
- Increase Product A pricing by 3% for new orders
- Follow up with Customer X on overdue payment
- Delay non-urgent material purchase by 5 days

### 2. Ask Gemma
A very simple chat screen.

#### Purpose
Allow the owner to ask business questions in plain English.

#### Design rules
- Very clean chat UI
- Suggested prompts shown before first message
- No technical terms like margin compression, confidence interval, elasticity
- Responses should be short by default, with an optional "Explain more" button

#### Suggested prompts
- Why is my cash tight this month?
- Should I raise prices now?
- Which customer should I follow up with first?
- What is the biggest risk this week?

#### Response style
Gemma must answer like a practical advisor:
- conclusion first
- reason second
- optional deeper explanation third

### 3. Import Data
This must feel very easy because Beginner users will likely start with scattered files.

#### Purpose
Let the owner upload existing business data without manual setup.

#### Supported files
- Excel
- CSV
- PDF invoices
- Supplier quotes
- Price lists

#### Flow
- Upload file
- Show AI-extracted preview
- Ask user to confirm or fix field mapping
- Save and continue

#### Important UX rule
Do not show complex database language like schema, columns, mapping engine, OCR confidence. Use plain labels like:
- Customer name
- Material cost
- Order amount
- Payment due date

### 4. Pricing Advice
This is the simplified version of Pricing Agent.

#### Purpose
Tell the owner when a pricing change is needed.

#### What it should show
- Current trigger
- Suggested price change
- Short explanation
- One small context note

#### Example
- Trigger: Steel prices increased this week
- Recommendation: Raise price of Product A by 3% for new orders
- Why: This protects your margin while keeping existing customer relationships stable

#### What not to show in Beginner mode
- supply-chain node maps
- customer sensitivity graphs
- model confidence tables
- advanced news feed filtering

### 5. Cash Flow Alerts
A simple alert-based screen instead of a full finance dashboard.

#### Purpose
Warn users early when cash flow pressure is building.

#### What it should show
- Current cash risk level
- 2 or 3 drivers behind that risk
- Recommended next step

#### Example
"Cash flow risk is medium this week because two payments are delayed and raw material costs increased. Collect from Customer X first."

### 6. Weekly Plan Screen
This is a dedicated screen version of the weekly action plan from home.

#### Purpose
Show all recommendations for the week in one place.

#### Structure
- Ranked list of actions
- Each item has: action, why, urgency, due timing
- Simple mark as done / snooze / ask Gemma controls

#### Value
This becomes the beginner user's main operating view.

## Navigation Structure
Beginner mode navigation should be minimal.

### Recommended nav items
- Home
- Ask Gemma
- Import Data
- Weekly Plan
- Alerts

Do not expose 10+ menu items.

## Tone and Copy Rules
All UI copy should be:
- plain
- short
- reassuring
- action-oriented

### Good examples
- Raise price for new orders
- Follow up with this customer today
- Material costs are rising
- This may reduce your cash next week

### Avoid
- margin compression
- forecast deviation
- receivables aging risk cluster
- supply-side elasticity
- predictive confidence model

## What Beginner Mode Hides
These features should either be hidden or moved behind an upgrade/toggle into higher modes:
- deep analytics dashboards
- complex trend charts
- supply chain node explorer
- customer segmentation controls
- advanced simulator settings
- technical reasoning traces
- dense tables with many filters

## Visual Design Guidance
- Large cards
- Strong whitespace
- Very few colors
- One clear primary action per screen
- Icons only where helpful
- Large tap targets for mobile
- Minimal charts, only if absolutely necessary

## Success Criteria
Beginner mode is successful if the user can:
- understand today's biggest business problem in under 10 seconds
- see the top 3 actions without scrolling much
- ask Gemma a question without training
- import old files without confusion
- take action without reading a dashboard

## Developer Notes
- Use same backend and Gemma orchestration layer as other modes
- Control this mode through a user profile field like `maturity_level = beginner`
- Hide advanced widgets at component level
- Keep prompts and AI responses shorter in this mode
- Use more prefilled suggestions and fewer blank states
