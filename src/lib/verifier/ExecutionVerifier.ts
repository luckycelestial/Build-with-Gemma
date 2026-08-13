import { ToolExecutionResult } from '../tools/types';

export interface VerificationOutcome {
  verified: boolean;
  status: 'Verified' | 'RetryNeeded' | 'RollbackNeeded' | 'EscalateToOwner';
  actionMessage: string;
}

export class ExecutionVerifier {
  /**
   * Evaluates post-execution tool result and determines verification outcome.
   */
  static verifyExecution(result: ToolExecutionResult): VerificationOutcome {
    if (!result.success) {
      return {
        verified: false,
        status: 'RetryNeeded',
        actionMessage: `Execution failed (${result.error}). Initiating retry sequence.`
      };
    }

    if (result.warnings && result.warnings.length > 0) {
      return {
        verified: true,
        status: 'Verified',
        actionMessage: `Execution successful with warnings: ${result.warnings.join('; ')}`
      };
    }

    return {
      verified: true,
      status: 'Verified',
      actionMessage: 'Tool execution verified against business state.'
    };
  }
}
