import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { 
  runPythonAnalysis, 
  runJSFallback, 
  fetchMarketNews, 
  buildBusinessContext, 
  queryGemmaAnalysis,
  DEFAULT_BUSINESS_DATA
} from '@/lib/revenue-orchestrator';
import { getPythonExecutable } from '@/lib/python';
export const dynamic = "force-dynamic";

export async function POST() {
  const mlDir = process.env.ML_ENGINE_DIR || path.resolve(process.cwd(), 'services/ml-engine');
  const samplePath = path.join(mlDir, 'sample_data.csv');
  
  // Verify sample data exists. If not, auto generate it using Python script
  if (!fs.existsSync(samplePath)) {
    const pythonScript = path.join(mlDir, 'analyze.py');
    const pythonExe = getPythonExecutable();
    await new Promise<void>((resolve) => {
      exec(`"${pythonExe}" "${pythonScript}" --generate-only`, () => resolve());
    });
  }

  try {
    let mlData;
    try {
      mlData = await runPythonAnalysis(samplePath);
    } catch (pyError: any) {
      console.warn("Python execution failed for sample data. Using JavaScript mockup:", pyError.message);
      mlData = JSON.parse(JSON.stringify(DEFAULT_BUSINESS_DATA));
    }
    
    const newsData = await fetchMarketNews();
    const businessContext = buildBusinessContext(mlData, newsData);
    
    // Query Gemma reasoning layer with fast timeout fallback for instant initial page render
    let gemmaAnalysis: any;
    try {
      gemmaAnalysis = await Promise.race([
        queryGemmaAnalysis(businessContext, null, mlData.shap_why_adjusted || null),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout waiting for Gemma response")), 2500))
      ]);
    } catch (gemmaErr: any) {
      console.warn("Fast load sample fallback active:", gemmaErr.message);
      gemmaAnalysis = {};
    }
    
    return NextResponse.json({
      success: true,
      summary: mlData.summary,
      kpis: {
        ...mlData.kpis,
        ai_scenario_forecast_lakh: gemmaAnalysis.scenario_adjusted_forecast ? parseFloat((gemmaAnalysis.scenario_adjusted_forecast.reduce((a: number, b: number) => a+b, 0) / 8).toFixed(2)) : 17.1,
        forecast_difference_lakh: gemmaAnalysis.scenario_adjusted_forecast ? parseFloat(((gemmaAnalysis.scenario_adjusted_forecast.reduce((a: number, b: number) => a+b, 0) / 8) - mlData.kpis.ml_forecast_8_weeks_avg_lakh).toFixed(2)) : -0.7,
        ai_executive_summary: gemmaAnalysis.executive_recommendation?.summary || "",
        forecast_explanation: gemmaAnalysis.forecast_explanation || "Based on current inputs, the baseline forecast is model-predicted at 68.57 Lakh avg monthly. Real-world headwinds like steel inflation and payment collection lag are forecast to drive a contractive adjusted trend."
      },
      forecast_data: {
        ...mlData.forecast_data,
        ai_scenario_prediction: gemmaAnalysis.scenario_adjusted_forecast || mlData.forecast_data.ml_prediction.map((v: number) => v * 0.96),
        why_adjusted: (gemmaAnalysis.why_adjusted && gemmaAnalysis.why_adjusted.length > 0)
          ? gemmaAnalysis.why_adjusted
          : (mlData.shap_why_adjusted && mlData.shap_why_adjusted.length > 0
              ? mlData.shap_why_adjusted
              : [])
      },
      shap_importance: mlData.shap_importance,
      shap_explanation: gemmaAnalysis.shap_explanation || "",
      market_intelligence: newsData.map((item: any) => {
        let impact = "Potential increase in supply cost. Watch inventory levels.";
        let action = "Optimize scrap management to reduce steel waste.";
        
        if (item.category === "Raw Material") {
          impact = "Raw material inflation compresses product margins by 2-4%.";
          action = "Consider index-linked pricing in long-term supply contracts.";
        } else if (item.category === "Industry Trend") {
          impact = "Increased demand for EV components. Existing capacity can be adapted.";
          action = "Allocate 1 CNC machine for prototype toolings for electric vehicle players.";
        } else if (item.category === "Government") {
          impact = "Lower cost of borrowing for precision tool setups.";
          action = "Submit application for machinery expansion subsidy under PLI.";
        }
        
        return {
          ...item,
          business_impact: impact,
          suggested_action: action
        };
      }),
      customer_intelligence: {
        ...mlData.customer_intelligence,
        customers: mlData.customer_intelligence.customers.map((c: any) => {
          const key = c.key;
          const narrative = gemmaAnalysis.customer_insights?.[key] || {};
          return {
            ...c,
            ai_summary: narrative.summary || "Stable customer account.",
            ai_observed_behavior: narrative.observed_behavior || "Consistently pays within payment terms.",
            ai_business_impact: narrative.business_impact || "Supports cash flow stability.",
            ai_recommendation: narrative.recommendation || "Maintain current payment configuration.",
            ai_confidence: narrative.confidence || "High"
          };
        })
      },
      executive_recommendation: gemmaAnalysis.executive_recommendation
    });
  } catch (error: any) {
    console.error("Failed to load sample dashboard:", error);
    return NextResponse.json({ error: "Failed to compile sample dashboard data: " + error.message }, { status: 500 });
  }
}
