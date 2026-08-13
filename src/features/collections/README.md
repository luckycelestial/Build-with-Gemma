# Accounts Receivable & Collections Department Module

## 📌 Purpose
Manages customer payment aging ledgers, overdue payment follow-ups, and AI collection outreach notice generation.

## 🛠️ Key Responsibilities
- **A/R Aging Analysis**: Categorizing overdue customer receivables (0-30 days, 31-60 days, 61+ days).
- **AI Collection Outreach Generator**: Generating tailored payment follow-up letters across Gentle, Professional, and Firm tones.
- **Multi-Channel Dispatch**: Preparing outreach notices for WhatsApp, Email, and SMS dispatch.
- **Outreach Audit Logger**: Recording all collection outreach events in the `OutreachLog` table.

## 📄 Submodule Architecture
- `components/`: Aging ledger table, AI outreach generator modal, tone/channel radio selectors.
- `services/`: `CollectionOutreachService`, `AgingLedgerService`.
- `workflow/`: Overdue Invoice Follow-Up & Escalation DAG workflows.
- `agent/`: `CollectionsWorker` manager agent.
- `events/`: Handlers for `InvoiceOverdue` and `PaymentDelayDetected` events.
- `types/`: `Order`, `CustomerLedger`, `OutreachNotice`, `OutreachLog` types.
- `database/`: Prisma data access for `Order` and `OutreachLog`.
- `tests/`: Department tests for outreach message generation.

## 🚀 Future Roadmap
- Automated payment reminder scheduling via WhatsApp API integration.
- Dynamic credit score penalties for chronic payment delays.
