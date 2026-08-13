import { CapabilityRegistryInstance } from './registry';

// Import Inventory Tools
import {
  UpdateInventoryQuantityTool,
  AddInventoryItemTool,
  SyncTallyInventoryTool,
  ReserveInventoryTool,
  ReleaseInventoryTool,
  ReceiveInventoryTool,
  TransferInventoryTool
} from './inventoryTools';

// Import Supplier & Procurement Tools
import {
  GenerateRFQTool,
  ParseSupplierInvoiceOCRTool,
  CompareSupplierQuotesTool,
  SelectSupplierTool,
  CreatePurchaseOrderTool,
  ApprovePurchaseOrderTool,
  CancelPurchaseOrderTool
} from './supplierTools';

// Import Pricing Tools
import {
  UpdatePricingRecommendationTool,
  UpdateShipmentStepTool,
  ImportPricingDocTool,
  RecalculateMarginsTool,
  RegenerateCustomerQuotesTool,
  PublishPriceChangesTool
} from './pricingTools';

// Import Collections Tools
import {
  GenerateCollectionOutreachTool,
  LogOutreachTool,
  ScheduleReminderTool,
  RecordPaymentTool,
  EscalateCollectionTool
} from './collectionsTools';

// Import Revenue Tools
import {
  RunRevenueForecastTool,
  QueryGemmaAdvisoryTool,
  GenerateSectionExplanationTool,
  RefreshForecastTool,
  AnalyzeRevenueRiskTool
} from './revenueTools';

// Import Comms Tools
import {
  SendWhatsAppMessageTool,
  SendEmailTool,
  SendNotificationTool,
  CreateApprovalRequestTool
} from './commsTools';

// Import Report Tools
import {
  GenerateReportTool,
  GenerateExecutiveBriefTool,
  ExportDashboardTool,
  SendScheduledReportTool
} from './reportTools';

// Import Workflow Tools
import {
  CreateWorkflowTool,
  UpdateWorkflowTool,
  CompleteWorkflowTool,
  PauseWorkflowTool,
  CancelWorkflowTool
} from './workflowTools';

// --- Auto-register tools into CapabilityRegistryInstance ---
const toolsToRegister = [
  // Inventory
  new UpdateInventoryQuantityTool(),
  new AddInventoryItemTool(),
  new SyncTallyInventoryTool(),
  new ReserveInventoryTool(),
  new ReleaseInventoryTool(),
  new ReceiveInventoryTool(),
  new TransferInventoryTool(),

  // Supplier & Procurement
  new GenerateRFQTool(),
  new ParseSupplierInvoiceOCRTool(),
  new CompareSupplierQuotesTool(),
  new SelectSupplierTool(),
  new CreatePurchaseOrderTool(),
  new ApprovePurchaseOrderTool(),
  new CancelPurchaseOrderTool(),

  // Pricing
  new UpdatePricingRecommendationTool(),
  new UpdateShipmentStepTool(),
  new ImportPricingDocTool(),
  new RecalculateMarginsTool(),
  new RegenerateCustomerQuotesTool(),
  new PublishPriceChangesTool(),

  // Collections
  new GenerateCollectionOutreachTool(),
  new LogOutreachTool(),
  new ScheduleReminderTool(),
  new RecordPaymentTool(),
  new EscalateCollectionTool(),

  // Revenue
  new RunRevenueForecastTool(),
  new QueryGemmaAdvisoryTool(),
  new GenerateSectionExplanationTool(),
  new RefreshForecastTool(),
  new AnalyzeRevenueRiskTool(),

  // Comms
  new SendWhatsAppMessageTool(),
  new SendEmailTool(),
  new SendNotificationTool(),
  new CreateApprovalRequestTool(),

  // Reports
  new GenerateReportTool(),
  new GenerateExecutiveBriefTool(),
  new ExportDashboardTool(),
  new SendScheduledReportTool(),

  // Workflows
  new CreateWorkflowTool(),
  new UpdateWorkflowTool(),
  new CompleteWorkflowTool(),
  new PauseWorkflowTool(),
  new CancelWorkflowTool()
];

toolsToRegister.forEach(tool => CapabilityRegistryInstance.registerTool(tool));

console.log(`✅ [CapabilityRegistry] Successfully initialized and registered ${toolsToRegister.length} Business Tools.`);

export * from './types';
export * from './BaseTool';
export * from './registry';
export { CapabilityRegistryInstance };
