import { prisma } from "../src/lib/prisma-client";

async function main() {
  console.log("Seeding database with updated real-world links and relative dates...");

  // Clean old data
  await prisma.supplier.deleteMany();
  await prisma.industryNews.deleteMany();
  await prisma.structuralRisk.deleteMany();
  await prisma.pricingRecommendation.deleteMany();
  await prisma.marketSignal.deleteMany();
  await prisma.shipmentStep.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.material.deleteMany();
  await prisma.inventoryItem.deleteMany();

  // Helper for dynamic relative dates
  const formatRelativeDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // 1. Seed Materials
  const materialAluminium = await prisma.material.create({
    data: {
      name: "Aluminium Alloy (6061)",
      currentCost: 380,
      marketCost: 427.12,
      supplier: "Bommasandra Metal Casting",
    },
  });

  const materialSteel = await prisma.material.create({
    data: {
      name: "Steel Rods (Mild)",
      currentCost: 58000,
      marketCost: 61480,
      supplier: "Peenya Steel Distributor",
    },
  });

  // 2. Seed Orders
  await prisma.order.createMany({
    data: [
      {
        id: "ORD-221",
        client: "Client X",
        margin: "14.2%",
        materialId: materialSteel.id,
      },
      {
        id: "ORD-214",
        client: "Client Y",
        margin: "9.5%",
        materialId: materialAluminium.id,
      },
    ],
  });

  // 3. Seed Shipments and ShipmentSteps
  const shipment1 = await prisma.shipment.create({
    data: {
      material: "Steel Bars (Mild Grade)",
      qty: "15 Tons",
      supplier: "Peenya Steel Distributor",
      currentNode: "Distributor Node (Bengaluru Outer Ring)",
      eta: `${formatRelativeDate(4)} (4 Days Delay)`,
      status: "delayed",
      gemmaAnnotation:
        "Steel batch stuck at distributor stage — 4 day delay risk. This creates a liquidity bottleneck for Order #221. Consider executing buffer pricing (+2.5% markup) to hedge against delayed cash collection.",
    },
  });

  await prisma.shipmentStep.createMany({
    data: [
      { shipmentId: shipment1.id, name: "Mine/Mill", status: "completed", sequence: 1 },
      { shipmentId: shipment1.id, name: "Distributor", status: "delayed", sequence: 2 },
      { shipmentId: shipment1.id, name: "Regional Supplier", status: "pending", sequence: 3 },
      { shipmentId: shipment1.id, name: "Warehouse", status: "pending", sequence: 4 },
      { shipmentId: shipment1.id, name: "CNC Facility", status: "pending", sequence: 5 },
    ],
  });

  const shipment2 = await prisma.shipment.create({
    data: {
      material: "Aluminium Alloy billets (6061)",
      qty: "5 Tons",
      supplier: "Bommasandra Metal Casting",
      currentNode: "Warehouse Node (Jigani Industrial)",
      eta: `${formatRelativeDate(0)} (On Time)`,
      status: "on-time",
      gemmaAnnotation:
        "Aluminium alloy supply is secure at standard rate. Standard margins are valid for this batch.",
    },
  });

  await prisma.shipmentStep.createMany({
    data: [
      { shipmentId: shipment2.id, name: "Mine/Mill", status: "completed", sequence: 1 },
      { shipmentId: shipment2.id, name: "Distributor", status: "completed", sequence: 2 },
      { shipmentId: shipment2.id, name: "Regional Supplier", status: "completed", sequence: 3 },
      { shipmentId: shipment2.id, name: "Warehouse", status: "on-time", sequence: 4 },
      { shipmentId: shipment2.id, name: "CNC Facility", status: "pending", sequence: 5 },
    ],
  });

  // 4. Seed MarketSignals
  await prisma.marketSignal.createMany({
    data: [
      {
        title: "Global Steel Index Surges 6% Post Import Tariff Adjustment",
        source: "MetalBulletin News",
        date: "2 hours ago",
        relevance: "high",
        tag: "Directly affects Mild Steel Rod order pricing (Order #221)",
        desc: "Supplier costs for Mild Steel Rods are set to escalate by ₹3,400/ton by next week.",
        url: "https://www.metalbulletin.com"
      },
      {
        title: "Bengaluru EV Parts Cluster Demand Increases by 30% YoY",
        source: "EconomicTimes Industry",
        date: "1 day ago",
        relevance: "medium",
        tag: "Long-term risk: 30% of your tooling output is ICE-specific",
        desc: "Traditional engine components face shrinking order volume. Shift to EV casing casting recommended.",
        url: "https://economictimes.indiatimes.com/industry/renewables/ev-sales-surge-in-karnataka"
      },
      {
        title: "Bommasandra Power Grid Announces 4-Hour Scheduled Daily Maintenance",
        source: "BESCOM Notification",
        date: "2 days ago",
        relevance: "high",
        tag: "Affects CNC facility operational overhead costs",
        desc: "Generator fuel backup costs will rise by ₹150/hour, reducing net margins on batch casting orders.",
        url: "https://bescom.karnataka.gov.in"
      },
    ],
  });

  // 5. Seed PricingRecommendations
  await prisma.pricingRecommendation.createMany({
    data: [
      {
        id: "REC-01",
        trigger: "Mild Steel Cost index +6.3% in Peenya Cluster",
        action: "Increase Price by +3.4% on Mild Steel products for new batches",
        confidence: "high",
        reasoning: JSON.stringify([
          "Supplier raw steel quotes rose by ₹3,600/ton yesterday.",
          "Your current net margin on Mild Steel parts is 11.2%, which is close to your critical safety margin (10.0%).",
          "Client sensitivity analysis indicates a price elasticity of -0.4, allowing a +3.4% pass-through markup without order volume deterioration.",
        ]),
        accepted: false,
        rejected: false,
        expanded: false,
        sourceName: "MetalBulletin News",
        sourceDate: "Yesterday",
        sourceUrl: "https://www.metalbulletin.com"
      },
      {
        id: "REC-02",
        trigger: "BESCOM 4-Hr power maintenance surcharge added",
        action: "Apply ₹40/batch operational energy buffer surcharge",
        confidence: "medium",
        reasoning: JSON.stringify([
          "CNC operational backup diesel generator runs cost ₹150 extra per hour.",
          "This surcharge directly prevents a 1.2% gross margin bleed on current scheduled batch runs.",
        ]),
        accepted: false,
        rejected: false,
        expanded: false,
        sourceName: "BESCOM Portal",
        sourceDate: "2 days ago",
        sourceUrl: "https://bescom.karnataka.gov.in"
      },
    ],
  });

  // 6. Seed StructuralRisks
  await prisma.structuralRisk.create({
    data: {
      trend: "ICE Part Production",
      status: "Softening Demand",
      title: "Transition Risk: Traditional Engine Cylinder casting",
      description: "Based on market forecast models, traditional ICE parts orders from Tier-1 auto-component distributors are projected to soften by 30% over the next 18 months due to accelerating EV adoption in Bengaluru's local clusters.",
      gemmaAdvisory: "We recommend diversifying CNC production towards EV structural casings and heat sinks. 45% of your current milling tooling setup can be reprofiled without requiring major capital investments."
    }
  });

  // 7. Seed IndustryNews
  await prisma.industryNews.createMany({
    data: [
      {
        title: "Peenya Industrial Area notified as special investment region; industry bodies laud move",
        source: "The Hindu",
        date: "1 hour ago",
        summary: "Karnataka declares Peenya Industrial Area as Special Investment Region, aiming to boost infrastructure, investment, and job creation.",
        category: "Infrastructure",
        image: "https://th-i.thgim.com/public/incoming/s8gx6b/article69684096.ece/alternates/LANDSCAPE_1200/DJI_0032.jpg",
        url: "https://www.thehindu.com/news/cities/bangalore/peenya-industrial-area-notified-as-special-investment-region-industry-bodies-laud-move/article69682390.ece"
      },
      {
        title: "IMTEX Forming 2026 inaugurated at BIEC in Bengaluru",
        source: "The Hindu",
        date: "3 hours ago",
        summary: "The exhibition features cutting-edge technologies in presses, bending, welding, laser systems, robotics, and automation, reflecting sheet-metal processing innovation.",
        category: "Manufacturing",
        image: "https://th-i.thgim.com/public/incoming/2y2mmx/article70536447.ece/alternates/LANDSCAPE_1200/2026-01-21T131301Z_1479325586_RC2U4FA867TG_RTRMADP_3_INDIA-RBI-ECONOMY.JPG",
        url: "https://www.thehindu.com/news/cities/bangalore/imtex-forming-2026-inaugurated-at-biec-in-bengaluru/article70534695.ece"
      },
      {
        title: "KERC approves APR true-up; consumers to see bill adjustments from May across Karnataka",
        source: "The Hindu",
        date: "1 day ago",
        summary: "KERC approves a true-up, increasing electricity bills by 56 paise per unit from May 2026 for Karnataka consumers.",
        category: "Power Tariff",
        image: "https://th-i.thgim.com/public/incoming/juy89y/article70875363.ece/alternates/LANDSCAPE_1200/IMG_4499.jpg",
        url: "https://www.thehindu.com/news/cities/bangalore/kerc-approves-apr-true-up-consumers-to-see-bill-adjustments-from-may-across-karnataka/article70874202.ece"
      },
      {
        title: "Government clears 55 projects worth ₹7,506 crore, to create over 28,000 jobs in Karnataka",
        source: "The Hindu",
        date: "2 days ago",
        summary: "Of these, 41 projects will be located outside Bengaluru, as part of the Beyond Bengaluru initiative to decentralize industrial growth.",
        category: "Industrial Projects",
        image: "https://th-i.thgim.com/public/incoming/ghf5ns/article71125133.ece/alternates/LANDSCAPE_1200/Karnataka-readyG1HFM2S2O.3.jpg.jpg",
        url: "https://www.thehindu.com/news/national/karnataka/government-clears-55-projects-worth-7506-crore-to-create-over-28000-jobs-in-karnataka/article71123280.ece"
      }
    ]
  });

  // 8. Seed InventoryItems
  await prisma.inventoryItem.createMany({
    data: [
      {
        name: "Solid Carbide End Mills (4-Flute, 12mm)",
        category: "Tooling",
        sku: "TL-EM-CAR-12",
        quantity: 45,
        unit: "pcs",
        location: "Cabinet B, Shelf 3",
        minThreshold: 15,
        status: "In Stock",
        image: "/inventory/carbide-end-mill.png"
      },
      {
        name: "Aluminum 6061-T6 Raw Blocks (150x150x50mm)",
        category: "Raw Material",
        sku: "RM-AL-6061-150",
        quantity: 12,
        unit: "pcs",
        location: "Raw Stock Area, Rack A-2",
        minThreshold: 20,
        status: "Low Stock",
        image: "/inventory/aluminum-blocks.png"
      },
      {
        name: "Machined Aerospace Brackets (Grade A-5)",
        category: "Finished",
        sku: "FG-AE-BRKT-A5",
        quantity: 180,
        unit: "pcs",
        location: "Finished Goods Vault, Bin 7",
        minThreshold: 50,
        status: "In Stock",
        image: "/inventory/aerospace-bracket.png"
      },
      {
        name: "Machined EV Battery Housing Casings (Model S-3)",
        category: "WIP",
        sku: "WP-EV-BATT-S3",
        quantity: 4,
        unit: "pcs",
        location: "Assembly Bay 2",
        minThreshold: 10,
        status: "Low Stock",
        image: "/inventory/battery-housing.png"
      }
    ]
  });

  // 9. Seed Suppliers (Directory)
  await prisma.supplier.createMany({
    data: [
      {
        name: "Bommasandra Metal Casting",
        materials: "Aluminium Alloy (6061, 7075)",
        avgLeadTime: "4 Days",
        estimatedQuote: "₹380 / kg",
        reliabilityRating: "98% Excellent",
        contactChannel: "sales@bommasandrametal.in",
        sourceUrl: "https://dir.indiamart.com/bengaluru/metal-castings.html"
      },
      {
        name: "Jigani Tooling Labs Ltd",
        materials: "Carbide bits, coolant, drill rods",
        avgLeadTime: "3 Days",
        estimatedQuote: "₹340 / pc",
        reliabilityRating: "95% High",
        contactChannel: "procurement@jiganitooling.co.in",
        sourceUrl: "https://dir.indiamart.com/bengaluru/cnc-tooling-holders.html"
      },
      {
        name: "Peenya Steel Distributors",
        materials: "Mild Steel, Carbon billets",
        avgLeadTime: "6 Days",
        estimatedQuote: "₹58,000 / ton",
        reliabilityRating: "89% Stable",
        contactChannel: "orders@peenyasteels.com",
        sourceUrl: "https://dir.indiamart.com/bengaluru/mild-steel-round-bars.html"
      },
      {
        name: "Peenya Industrial Area (Karnataka Tooling Co.)",
        materials: "Drill inserts, grinding wheels",
        avgLeadTime: "7 Days",
        estimatedQuote: "₹410 / pc",
        reliabilityRating: "85% Stable",
        contactChannel: "contact@kartool.in",
        sourceUrl: "https://dir.indiamart.com/bengaluru/grinding-wheels.html"
      },
      {
        name: "Whitefield Precision Alloys",
        materials: "Nickel Alloys, High-tensile fasteners",
        avgLeadTime: "5 Days",
        estimatedQuote: "₹720 / kg",
        reliabilityRating: "93% High",
        contactChannel: "sales@whitefieldalloys.co.in",
        sourceUrl: "https://dir.indiamart.com/bengaluru/nickel-alloy.html"
      },
      {
        name: "Yeshwanthpur Industrial Steel",
        materials: "Stainless Steel sheets, angle bars",
        avgLeadTime: "3 Days",
        estimatedQuote: "₹64,000 / ton",
        reliabilityRating: "91% Stable",
        contactChannel: "yeshwanthpur.steel@gmail.com",
        sourceUrl: "https://dir.indiamart.com/bengaluru/stainless-steel-sheets.html"
      },
      {
        name: "Rajajinagar Carbide Tools",
        materials: "Carbide inserts, boring bars",
        avgLeadTime: "2 Days",
        estimatedQuote: "₹290 / pc",
        reliabilityRating: "96% Excellent",
        contactChannel: "support@rajcarbide.in",
        sourceUrl: "https://dir.indiamart.com/bengaluru/carbide-inserts.html"
      },
      {
        name: "Hosur Casting Works",
        materials: "Iron castings, engine cylinder castings",
        avgLeadTime: "6 Days",
        estimatedQuote: "₹310 / kg",
        reliabilityRating: "88% Stable",
        contactChannel: "info@hosurcastings.com",
        sourceUrl: "https://dir.indiamart.com/bengaluru/cast-iron-castings.html"
      },
      {
        name: "Nelamangala Steel Tubes",
        materials: "Seamless pipes, hollow steel sections",
        avgLeadTime: "8 Days",
        estimatedQuote: "₹56,000 / ton",
        reliabilityRating: "82% Moderate",
        contactChannel: "supply@nelasteel.in",
        sourceUrl: "https://dir.indiamart.com/bengaluru/seamless-steel-tubes.html"
      },
      {
        name: "Doddaballapur Tooling Allied",
        materials: "Milling cutters, machine vices",
        avgLeadTime: "5 Days",
        estimatedQuote: "₹450 / pc",
        reliabilityRating: "94% High",
        contactChannel: "orders@doddaballapurtooling.com",
        sourceUrl: "https://dir.indiamart.com/bengaluru/milling-cutters.html"
      }
    ]
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
