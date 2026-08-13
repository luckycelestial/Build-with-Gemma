# Shared Core Infrastructure Module

## 📌 Purpose
Houses cross-cutting platform capabilities, global navigation layout components, the Business Capability Tool Registry (43 tools), Operations Engine, Workflow Engine state machine, and local Ollama (`gemma4:cloud`) LLM client.

## 🛠️ Key Responsibilities
- **Business Capability Tool Registry**: Cataloging and executing all 43 registered business tools with metadata and permission controls.
- **Workflow State Machine**: Executing DAG workflow step transitions and managing pending owner approval gates.
- **Operations Hub Registry**: Maintaining live status across all 8 domain business operations.
- **Ollama LLM Integration**: Managing requests to local Ollama (`gemma4:cloud`) with `cleanJsonText` and `safeParseJson` auto-repair logic.
- **Global Layout Shell**: Providing `Sidebar`, `TopHeader`, `DashboardLayout`, `ThemeContext`, and `BusinessDataContext`.

## 📄 Submodule Architecture
- `components/`: `Sidebar.tsx`, `TopHeader.tsx`, `DashboardLayout.tsx`, `ThemeToggle.tsx`, `TierSelector.tsx`.
- `tools/`: Capability Tool Registry (`inventoryTools.ts`, `pricingTools.ts`, `supplierTools.ts`, `collectionsTools.ts`, `revenueTools.ts`, `reportTools.ts`, `commsTools.ts`, `workflowTools.ts`).
- `operations/`: `OperationService.ts`, `OperationRegistry.ts`, `Operation.ts`.
- `workflows/`: `WorkflowEngine.ts`, `WorkflowService.ts`.
- `services/`: `ActionCenterService.ts`, `TimelineService.ts`, `TaskService.ts`.
- `ai/`: `ai.ts` Ollama client and auto-reparative JSON parser.
- `db/`: Prisma Client singleton (`prisma-client.ts`).
- `types/`: Core system types and event schemas.

## 🚀 Future Roadmap
- Distributed event bus streaming with WebSockets for multi-device owner notifications.
