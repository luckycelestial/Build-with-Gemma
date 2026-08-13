import { NextResponse } from 'next/server';
import { CapabilityRegistryInstance } from '@/lib/tools';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    const result = await CapabilityRegistryInstance.executeTool('sync_tally_inventory', {
      items: body.items
    }, {
      source: 'TallyERP',
      initiatedBy: 'TallyConnector'
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || "Tally sync failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Tally Prime ERP Inventory sync complete.",
      count: result.data.syncedCount,
      syncedItems: result.data.syncedItems
    });
  } catch (error: any) {
    console.error("Tally sync API route error:", error);
    return NextResponse.json({ error: "Tally synchronization failed: " + error.message }, { status: 500 });
  }
}

