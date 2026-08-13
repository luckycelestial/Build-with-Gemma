export type ConnectorType =
  | 'Messaging'
  | 'ERP'
  | 'OCR'
  | 'Payment'
  | 'Shipping'
  | 'Email'
  | 'MarketData'
  | 'Government';

export interface BaseConnector {
  id: string;
  name: string;
  type: ConnectorType;
  providerName: string;
  status: 'Connected' | 'Disconnected' | 'Degraded';
  isMock: boolean;
}

export interface IMessagingConnector extends BaseConnector {
  sendMessage(recipient: string, messageText: string): Promise<{ success: boolean; messageId: string }>;
}

export interface IERPConnector extends BaseConnector {
  syncInventory(items: any[]): Promise<{ success: boolean; count: number }>;
}

export interface IOCRConnector extends BaseConnector {
  parseDocument(fileBuffer: Buffer | string): Promise<{ success: boolean; extractedText: string; metadata: any }>;
}
