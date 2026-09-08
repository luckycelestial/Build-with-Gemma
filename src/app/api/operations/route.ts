import { NextResponse } from 'next/server';
import { OperationService } from '@/lib/operations/OperationService';
import { ActionCenterService } from '@/lib/domain/ActionCenterService';
import { TimelineService } from '@/lib/domain/TimelineService';
import { WorkflowService } from '@/lib/workflows/WorkflowService';
import { BusinessStoryEngine } from '@/lib/story/BusinessStoryEngine';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const operations = await OperationService.getOperationsOverview();
    const actionCenter = ActionCenterService.getActionCenterState();
    const timeline = TimelineService.getExecutiveTimeline();
    const workflows = WorkflowService.getRunningWorkflows();
    const stories = BusinessStoryEngine.generateStories();

    return NextResponse.json({
      success: true,
      operations,
      actionCenter,
      timeline,
      workflows,
      stories
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch operations: " + error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const operations = await OperationService.getOperationsOverview();
    const actionCenter = ActionCenterService.getActionCenterState();
    return NextResponse.json({
      success: true,
      operations,
      actionCenter
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to handle operations POST: " + error.message }, { status: 500 });
  }
}
