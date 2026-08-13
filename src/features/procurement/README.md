# Procurement & Supply Chain Department Module

## 📌 Purpose
Manages raw material inventory stock, tooling safety assets, vendor quote comparisons, automated RFQ generation, and shipment transit logistics tracking.

## 🛠️ Key Responsibilities
- **Inventory Stock Ledger**: Tracking SKU item quantities, minimum thresholds, and locations.
- **Automated RFQ Generation**: Generating supplier quotation request letters when safety stock is breached.
- **Logistics Transit Tracker**: Monitoring raw material shipments in transit across logistics checkpoints.
- **Tally ERP Inventory Sync**: Syncing inventory items and purchase orders with Tally ERP.

## 📄 Submodule Architecture
- `components/`: SKU inventory tables, stock adjusters, RFQ generator modal, shipment transit tracker.
- `services/`: `ProcurementService`, `TallySyncService`, `LogisticsTrackerService`.
- `workflow/`: Low Stock Raw Material Procurement & RFQ DAG workflows.
- `agent/`: `ProcurementWorker` manager agent.
- `events/`: Handlers for `InventoryThresholdBreached` and `ShipmentStepUpdated` events.
- `types/`: `InventoryItem`, `Supplier`, `RFQRequest`, `Shipment` interface definitions.
- `database/`: Prisma data access objects for `InventoryItem`, `Supplier`, and `Shipment`.
- `tests/`: Department unit tests for stock adjusters and RFQ generators.

## 🚀 Future Roadmap
- Integration with live WhatsApp Business API for direct PO confirmations.
- Automated supplier lead-time risk scoring engine based on historic shipment delays.
