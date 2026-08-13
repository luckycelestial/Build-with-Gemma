import { OperationRegistryInstance } from './OperationRegistry';
import { OperationId, OperationSnapshot } from './types';

export class OperationService {
  /**
   * Returns current snapshots for all registered operations.
   */
  static async getOperationsOverview(): Promise<OperationSnapshot[]> {
    const snapshots = OperationRegistryInstance.getAllSnapshots();

    // Enrich with database state on server environment if reachable
    if (typeof window === 'undefined') {
      try {
        const { prisma } = await import('../prisma-client');
        const dbStates = await prisma.operationState.findMany();
        dbStates.forEach(dbState => {
          const op = OperationRegistryInstance.getOperation(dbState.operationId as OperationId);
          if (op) {
            op.updateMetrics(dbState.kpis as any, dbState.status as any);
          }
        });
      } catch {
        // Fallback to in-memory registry
      }
    }

    return OperationRegistryInstance.getAllSnapshots();
  }

  /**
   * Returns snapshot for a specific operation.
   */
  static async getOperationDetails(id: OperationId): Promise<OperationSnapshot | null> {
    const op = OperationRegistryInstance.getOperation(id);
    if (!op) return null;
    return op.getSnapshot();
  }
}
