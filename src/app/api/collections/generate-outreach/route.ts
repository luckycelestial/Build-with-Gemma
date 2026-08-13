import { NextResponse } from 'next/server';
import { CapabilityRegistryInstance } from '@/lib/tools';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { client, delayedInvoices, averageDelay, outstandingBalance, tone, channel } = await req.json();

    if (!client || outstandingBalance === undefined) {
      return NextResponse.json({ error: "Missing customer details or outstanding metrics" }, { status: 400 });
    }

    const result = await CapabilityRegistryInstance.executeTool('generate_collection_outreach', {
      client,
      delayedInvoices,
      averageDelay,
      outstandingBalance,
      tone,
      channel
    }, {
      source: 'WebUI',
      initiatedBy: 'CollectionsManager'
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || "Failed to generate outreach" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      content: result.data.content,
      fallback: result.data.isFallback
    });
  } catch (error: any) {
    console.error("Outreach generator route error:", error);
    return NextResponse.json({ error: "Failed to generate outreach: " + error.message }, { status: 500 });
  }
}

