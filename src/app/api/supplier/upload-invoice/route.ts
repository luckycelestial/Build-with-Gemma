import { NextResponse } from 'next/server';
import { CapabilityRegistryInstance } from '@/lib/tools';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No invoice file uploaded" }, { status: 400 });
    }

    const result = await CapabilityRegistryInstance.executeTool('parse_supplier_invoice', {
      fileName: file.name
    }, {
      source: 'WebUI',
      initiatedBy: 'ProcurementManager'
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || "Failed to parse invoice" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: result.data.count,
      items: result.data.items,
      fallback: true
    });
  } catch (error: any) {
    console.error("Supplier invoice upload route error:", error);
    return NextResponse.json({ error: "Failed to upload and parse invoice: " + error.message }, { status: 500 });
  }
}

