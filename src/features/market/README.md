# Market Intelligence Department Module

## 📌 Purpose
Crawls real-time industry news feeds and commodity price indices to detect macroeconomic market signals affecting SME precision manufacturing.

## 🛠️ Key Responsibilities
- **Google News RSS Crawler**: Indexing manufacturing news feeds for raw material price surges, power tariff changes, and trade policies.
- **Commodity Index Tracking**: Monitoring Peenya cluster steel spot prices and aluminum index trends.
- **Market Signal Publishing**: Emitting detected market signals to `BusinessEventBus` for Executive CTO SOP evaluation.

## 📄 Submodule Architecture
- `components/`: Market signal cards, commodity price index tickers, category filter badges.
- `services/`: `NewsCrawlerService`, `CommodityIndexService`.
- `agent/`: `MarketWorker` manager agent.
- `events/`: Handlers for `MarketSignalDetected` events.
- `types/`: `MarketSignal`, `CommodityPriceIndex` types.
- `database/`: Prisma data access for `MarketSignal`.
- `tests/`: Department tests for news RSS parsing.

## 🚀 Future Roadmap
- Sentiment analysis pipeline scoring macroeconomic news impact on raw material lead times.
