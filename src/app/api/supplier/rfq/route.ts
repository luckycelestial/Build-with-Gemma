import { NextResponse } from 'next/server';
import { CapabilityRegistryInstance } from '@/lib/tools';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, sku, quantity, minThreshold, supplierName } = await req.json();

    if (!name || !sku) {
      return NextResponse.json({ error: "Missing material/SKU data parameters" }, { status: 400 });
    }

    const result = await CapabilityRegistryInstance.executeTool('generate_rfq', {
      name,
      sku,
      quantity,
      minThreshold,
      supplierName
    }, {
      source: 'WebUI',
      initiatedBy: 'ProcurementManager'
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || "Failed to generate RFQ" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      rfqLetter: result.data.rfqLetter,
      fallback: result.data.isFallback
    });
  } catch (error: any) {
    console.error("Ollama RFQ generator error:", error);
    return NextResponse.json({ error: "Failed to generate RFQ letter: " + error.message }, { status: 500 });
  }
}

