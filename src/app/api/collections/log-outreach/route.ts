import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { CapabilityRegistryInstance } from '@/lib/tools';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await prisma.outreachLog.findMany({
      orderBy: { sentAt: 'desc' }
    });
    return NextResponse.json({ success: true, logs });
  } catch (err) {
    return NextResponse.json({ success: true, logs: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { client, channel, tone, content } = await req.json();

    if (!client || !content) {
      return NextResponse.json({ error: "Missing log details" }, { status: 400 });
    }

    const result = await CapabilityRegistryInstance.executeTool('log_collection_outreach', {
      client,
      channel,
      tone,
      content
    }, {
      source: 'WebUI',
      initiatedBy: 'CollectionsManager'
    });

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || "Failed to log outreach" }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: result.data });
  } catch (error: any) {
    console.error("Failed to log outreach:", error);
    return NextResponse.json({ error: "Failed to log outreach: " + error.message }, { status: 500 });
  }
}

