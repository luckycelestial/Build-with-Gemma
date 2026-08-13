import { BaseConnector, ConnectorType } from './types';

class ConnectorRegistryClass {
  private connectors: Map<string, BaseConnector> = new Map();

  constructor() {
    this.registerDefaultConnectors();
  }

  private registerDefaultConnectors(): void {
    // 1. WhatsApp Neonize Messaging Connector
    this.register({
      id: 'conn-whatsapp-neonize',
      name: 'WhatsApp Web Protocol Connector',
      type: 'Messaging',
      providerName: 'Neonize Python Daemon',
      status: 'Connected',
      isMock: false
    });

    // 2. Tally Prime ERP Connector
    this.register({
      id: 'conn-tally-prime',
      name: 'Tally Prime ERP Connector',
      type: 'ERP',
      providerName: 'Tally.NET HTTP Gateway',
      status: 'Connected',
      isMock: false
    });

    // 3. Google News RSS Market Data Connector
    this.register({
      id: 'conn-gnews-rss',
      name: 'Google News RSS Feed Crawler',
      type: 'MarketData',
      providerName: 'Google News RSS XML',
      status: 'Connected',
      isMock: false
    });

    // 4. Ollama Document OCR Connector
    this.register({
      id: 'conn-ollama-ocr',
      name: 'Gemma 4 Document OCR Connector',
      type: 'OCR',
      providerName: 'Ollama Server',
      status: 'Connected',
      isMock: false
    });
  }

  public register(connector: BaseConnector): void {
    this.connectors.set(connector.id, connector);
  }

  public getConnector(id: string): BaseConnector | undefined {
    return this.connectors.get(id);
  }

  public getConnectorsByType(type: ConnectorType): BaseConnector[] {
    return Array.from(this.connectors.values()).filter(c => c.type === type);
  }

  public getAllConnectors(): BaseConnector[] {
    return Array.from(this.connectors.values());
  }
}

export const ConnectorRegistryInstance = new ConnectorRegistryClass();
