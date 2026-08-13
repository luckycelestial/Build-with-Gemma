import { NextResponse } from 'next/server';
import { ExecutiveDemoSimulator } from '@/lib/demo/ExecutiveDemoSimulator';

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Run real-time simulation on server
    await ExecutiveDemoSimulator.runDemoSimulation();
    return NextResponse.json({ success: true, message: "Demo simulation completed." });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to run demo simulation: " + error.message }, { status: 500 });
  }
}
