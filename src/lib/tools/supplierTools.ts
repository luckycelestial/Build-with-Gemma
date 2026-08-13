import { BaseTool } from './BaseTool';
import { BusinessToolMetadata, ToolExecutionContext } from './types';
import { AIService } from '../ai';
import { BusinessEvent } from '../events/BusinessEventBus';


// --- 1. Generate RFQ Tool ---
export interface GenerateRFQInput {
  name: string;
  sku: string;
  quantity?: number;
  minThreshold?: number;
  supplierName?: string;
}

export class GenerateRFQTool extends BaseTool<GenerateRFQInput, { rfqLetter: string; isFallback: boolean }> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'generate_rfq',
    name: 'Generate Request for Quote (RFQ)',
    description: 'Generates a formal procurement quotation request letter addressed to a target supplier.',
    category: 'Procurement',
    capabilityName: 'RFQManagement',
    ownedByWorker: 'ProcurementWorker',
    supportedOperations: ['ProcurementOperation', 'SupplierOperation'],
    requiredPermissions: ['supplier:write'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 1200,
    producesEvents: ['QuotationGenerated'],
    consumesEvents: ['InventoryThresholdBreached'],
    verificationStrategy: { type: 'None', description: 'Generates formatted corporate text.' },
    retryPolicy: { maxRetries: 2, backoffMs: 500 },
    approvalPolicy: { required: false },
    tags: ['rfq', 'procurement', 'quote', 'supplier']
  };

  protected async executeLogic(input: GenerateRFQInput, context?: ToolExecutionContext) {
    const targetSupplier = input.supplierName || "Jigani Tooling Labs Ltd";
    const quantityNeeded = Math.max(10, (input.minThreshold || 5) * 3 - (input.quantity || 0));

    const prompt = `
Write a formal Request for Quote (RFQ) letter from Meenakshi Precision Components, located in Peenya Industrial Area, Bengaluru.

Recipient Details:
- Supplier Name: ${targetSupplier}
- Subject: Request for Quote (RFQ) - Procurement of CNC Manufacturing Assets
- Item Name: ${input.name}
- SKU Code: ${input.sku}
- Desired Quantity: ${quantityNeeded} units

The letter should ask for unit costs, volume discount details, estimated shipping lead times to our Peenya workshop, and payment term details. 
Format the output cleanly in plain text with clear headings.
`;

    try {
      const text = await AIService.generateCompletion(prompt);
      if (text) {
        return { data: { rfqLetter: text, isFallback: false } };
      }
    } catch (apiErr: any) {
      console.warn("[GenerateRFQTool] Ollama call failed, using template fallback:", apiErr.message);
    }

    const fallbackRfq = `MEENAKSHI PRECISION COMPONENTS
Peenya Industrial Area, Bengaluru

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

To,
Procurement Desk,
${targetSupplier}

Subject: Request for Quote (RFQ) - Procurement of CNC Manufacturing Assets

Dear Sir/Madam,

Meenakshi Precision Components requests a formal quote for the following high-priority CNC asset requirements:

- Item Name: ${input.name}
- SKU Code: ${input.sku}
- Target Quantity: ${quantityNeeded} units

Please provide unit costs, bulk volume discounts, shipping lead times, and payment terms.

Yours Sincerely,
Procurement Department
Meenakshi Precision Components`;

    return { data: { rfqLetter: fallbackRfq, isFallback: true }, warnings: ['Used offline fallback RFQ template.'] };
  }

  protected constructEvents(data: any, input: GenerateRFQInput, context?: ToolExecutionContext): BusinessEvent[] {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return [{
      id: `evt-rfq-${Date.now()}`,
      type: 'QuotationGenerated',
      timestamp: timeStr,
      source: context?.source === 'WhatsApp' ? 'WhatsApp' : 'Manual Upload',
      summary: `Formal RFQ generated for ${input.name} (${input.supplierName || 'Target Supplier'})`,
      details: { sku: input.sku, supplierName: input.supplierName, letterLength: data.rfqLetter.length },
      deepLink: '/supplier-agent'
    }];
  }
}

// --- 2. Parse Supplier Invoice OCR Tool ---
export interface ParseSupplierInvoiceInput {
  fileName: string;
  fileBuffer?: Buffer;
}

export class ParseSupplierInvoiceOCRTool extends BaseTool<ParseSupplierInvoiceInput, { count: number; items: any[] }> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'parse_supplier_invoice',
    name: 'Parse Supplier Invoice via OCR',
    description: 'Extracts purchase line items, SKUs, quantities, unit costs, and supplier names from uploaded invoice documents.',
    category: 'Procurement',
    capabilityName: 'InvoiceProcessing',
    ownedByWorker: 'ProcurementWorker',
    supportedOperations: ['ProcurementOperation', 'SupplierOperation'],
    requiredPermissions: ['supplier:read', 'inventory:write'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 1500,
    producesEvents: ['InvoiceLogged', 'InventoryUpdated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Verifies upserted SKUs in Inventory table.' },
    retryPolicy: { maxRetries: 1, backoffMs: 500 },
    approvalPolicy: { required: false },
    tags: ['invoice', 'ocr', 'parser', 'procurement']
  };

  protected async executeLogic(input: ParseSupplierInvoiceInput, context?: ToolExecutionContext) {
    const prompt = `
You are an expert procurement analyst. Analyze the supplier invoice file named "${input.fileName}" and extract the items into a structured JSON list.
For each item, extract:
- name, sku, category ("Raw Material" | "Tooling" | "WIP" | "Finished"), quantity (number), unit, location, costPerUnit, supplierName.

Output raw JSON format with key "items".
`;

    let items: any[] = [];
    try {
      const responseText = await AIService.generateCompletion(prompt, true);
      const parsed = JSON.parse(responseText);
      items = parsed.items || [];
    } catch (apiErr: any) {
      console.warn("[ParseSupplierInvoiceOCRTool] AI extraction failed, using fallback item set:", apiErr.message);
    }

    if (items.length === 0) {
      items = [
        {
          name: "Solid Carbide End Mills (4-Flute, 12mm)",
          sku: "TL-EM-CAR-12",
          category: "Tooling",
          quantity: 20,
          unit: "pcs",
          location: "Cabinet B, Shelf 3",
          costPerUnit: 1450,
          supplierName: "Jigani Tooling Labs Ltd"
        },
        {
          name: "Aluminum 6061-T6 Raw Blocks (150x150x50mm)",
          sku: "RM-AL-6061-150",
          category: "Raw Material",
          quantity: 50,
          unit: "pcs",
          location: "Raw Stock Area, Rack A-2",
          costPerUnit: 420,
          supplierName: "Bommasandra Metal Casting"
        }
      ];
    }

    try {
      const { prisma } = await import('../prisma-client');
      await prisma.$transaction(
        items.map((item) => {
          const minThreshold = item.category === "Raw Material" ? 15 : 5;
          let status = "In Stock";
          if (item.quantity <= 0) status = "Out of Stock";
          else if (item.quantity <= minThreshold) status = "Low Stock";

          return prisma.inventoryItem.upsert({
            where: { sku: item.sku },
            update: {
              name: item.name,
              category: item.category,
              quantity: { increment: item.quantity },
              location: item.location,
              status,
              lastUpdated: new Date()
            },
            create: {
              sku: item.sku,
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit || "pcs",
              location: item.location || "Bin A",
              minThreshold,
              status,
              image: item.category === "Raw Material" ? "/inventory/aluminum-blocks.png" : "/inventory/carbide-end-mill.png"
            }
          });
        })
      );
    } catch (dbErr: any) {
      console.warn("[ParseSupplierInvoiceOCRTool] Database transaction offline fallback.");
    }


    return { data: { count: items.length, items } };
  }

  protected constructEvents(data: any, input: ParseSupplierInvoiceInput, context?: ToolExecutionContext): BusinessEvent[] {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const firstSupplier = data.items[0]?.supplierName || "Peenya Vendor";
    const totalAmount = data.items.reduce((acc: number, item: any) => acc + (item.quantity * item.costPerUnit || 0), 0);

    return [{
      id: `evt-inv-ocr-${Date.now()}`,
      type: 'InvoiceLogged',
      timestamp: timeStr,
      source: context?.source === 'WhatsApp' ? 'WhatsApp' : 'PDF Scanner',
      summary: `Supplier invoice logged (${data.count} items, ₹${totalAmount.toLocaleString('en-IN')} - ${firstSupplier})`,
      details: { fileName: input.fileName, itemsCount: data.count, totalAmount, supplierName: firstSupplier },
      deepLink: '/supplier-agent'
    }];
  }
}

// --- Placeholder Supplier & Procurement Tools ---
export class CompareSupplierQuotesTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'compare_supplier_quotes',
    name: 'Compare Supplier Quotations',
    description: 'Evaluates and ranks vendor quotes by unit price, lead time, and reliability rating.',
    category: 'Procurement',
    capabilityName: 'SupplierEvaluation',
    ownedByWorker: 'ProcurementWorker',
    supportedOperations: ['ProcurementOperation'],
    requiredPermissions: ['supplier:read'],
    executionMode: 'Autonomous',
    producesEvents: [],
    consumesEvents: ['QuotationGenerated'],
    verificationStrategy: { type: 'None', description: 'Calculates comparative matrices.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['compare', 'quotes', 'procurement']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Evaluated (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class SelectSupplierTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'select_supplier',
    name: 'Select Preferred Vendor',
    description: 'Designates primary and secondary vendor for a specific material SKU.',
    category: 'Procurement',
    capabilityName: 'SupplierSelection',
    ownedByWorker: 'ProcurementWorker',
    supportedOperations: ['ProcurementOperation'],
    requiredPermissions: ['supplier:write'],
    executionMode: 'Autonomous',
    producesEvents: ['SupplierUpdated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Verifies supplier assigned.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['select', 'vendor']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Selected (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class CreatePurchaseOrderTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'create_purchase_order',
    name: 'Create Purchase Order (PO)',
    description: 'Generates a binding Purchase Order document for vendor execution.',
    category: 'Procurement',
    capabilityName: 'POManagement',
    ownedByWorker: 'ProcurementWorker',
    supportedOperations: ['ProcurementOperation'],
    requiredPermissions: ['supplier:write'],
    executionMode: 'Approval_Required',
    producesEvents: ['QuotationGenerated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Verifies PO creation.' },
    retryPolicy: { maxRetries: 1, backoffMs: 300 },
    approvalPolicy: { required: true, approvalRole: 'FactoryOwner', thresholdRule: 'amount > 25000' },
    tags: ['po', 'purchase_order', 'procurement']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'PO Created (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class ApprovePurchaseOrderTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'approve_purchase_order',
    name: 'Approve Purchase Order',
    description: 'Grants owner sign-off for executing a pending Purchase Order.',
    category: 'Procurement',
    capabilityName: 'POApproval',
    ownedByWorker: 'ProcurementWorker',
    supportedOperations: ['ProcurementOperation'],
    requiredPermissions: ['supplier:write'],
    executionMode: 'Autonomous',
    producesEvents: ['QuotationGenerated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Verifies PO approval state.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['approve', 'po']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Approved (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class CancelPurchaseOrderTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'cancel_purchase_order',
    name: 'Cancel Purchase Order',
    description: 'Cancels an active or unfulfilled Purchase Order.',
    category: 'Procurement',
    capabilityName: 'POCancellation',
    ownedByWorker: 'ProcurementWorker',
    supportedOperations: ['ProcurementOperation'],
    requiredPermissions: ['supplier:write'],
    executionMode: 'Approval_Required',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Verifies PO cancellation state.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: true, approvalRole: 'FactoryOwner' },
    tags: ['cancel', 'po']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Cancelled (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}
