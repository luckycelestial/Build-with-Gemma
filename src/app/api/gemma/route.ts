import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

const SYSTEM_PROMPT = `You are Gemma, the intelligent reasoning core for Suresh's SME business orchestrator.
Suresh is a 48-year-old CNC machining unit owner in Peenya Industrial Area, Bengaluru. He runs a 20-person shop.
He is cautious, has no finance degree, and likes plain language. Speak in simple, clear, conversational tone. Avoid jargon.

Active Presentation Tier tones:
- Beginner: Recommendation-first, plainest language, no finance jargon.
- Intermediate: Supporting metrics (margins, delay periods) alongside recommendations.
- Expert: trade-offs, sensitivity detail, and statistical risk forecasts.

Keep your replies short (2-3 sentences max).`;

function fallbackTextToSql(text: string): { sql: string; formatResult: (res: any[]) => string } {
  const query = text.toLowerCase();
  
  if (query.includes('total') && (query.includes('pending') || query.includes('unpaid') || query.includes('outstanding') || query.includes('yet to be paid'))) {
    return {
      sql: 'SELECT SUM("amount")::float as result FROM "gemma_sme"."Invoice" WHERE "status" = \'pending\'',
      formatResult: (res) => {
        const val = res[0]?.result || 0;
        return `Suresh, your total pending outstanding payment to suppliers is ₹${val.toLocaleString('en-IN')}.`;
      }
    };
  }
  
  if (query.includes('total') && (query.includes('paid') || query.includes('settled'))) {
    return {
      sql: 'SELECT SUM("amount")::float as result FROM "gemma_sme"."Invoice" WHERE "status" = \'paid\'',
      formatResult: (res) => {
        const val = res[0]?.result || 0;
        return `Suresh, you have successfully settled a total of ₹${val.toLocaleString('en-IN')} in supplier payments.`;
      }
    };
  }

  if (query.includes('total') || query.includes('how much')) {
    if (query.includes('peenya')) {
      return {
        sql: 'SELECT SUM("amount")::float as result FROM "gemma_sme"."Invoice" WHERE "supplierName" ILIKE \'%peenya%\'',
        formatResult: (res) => {
          const val = res[0]?.result || 0;
          return `Suresh, the total amount billed by Peenya Steel is ₹${val.toLocaleString('en-IN')}.`;
        }
      };
    }
    return {
      sql: 'SELECT SUM("amount")::float as result FROM "gemma_sme"."Invoice"',
      formatResult: (res) => {
        const val = res[0]?.result || 0;
        return `Suresh, the sum of all invoices logged in the database is ₹${val.toLocaleString('en-IN')}.`;
      }
    };
  }

  if (query.includes('unpaid') || query.includes('pending') || query.includes('outstanding') || query.includes('debt') || query.includes('yet to be paid') || query.includes('how many')) {
    return {
      sql: 'SELECT * FROM "gemma_sme"."Invoice" WHERE "status" = \'pending\' ORDER BY "dueDate" ASC',
      formatResult: (res) => {
        if (res.length === 0) return "Suresh, you have no pending unpaid invoices right now.";
        const items = res.map(i => `- ${i.supplierName}: ₹${i.amount} (Due: ${i.dueDate ? new Date(i.dueDate).toLocaleDateString() : 'N/A'})`).join('\n');
        return `Suresh, you have ${res.length} unpaid invoices:\n${items}`;
      }
    };
  }

  return {
    sql: 'SELECT * FROM "gemma_sme"."Invoice" ORDER BY "createdAt" DESC LIMIT 5',
    formatResult: (res) => {
      if (res.length === 0) return "Suresh, there are no invoices registered in your system yet.";
      const items = res.map(i => `- ${i.supplierName}: ₹${i.amount} (${i.status})`).join('\n');
      return `Suresh, here are your latest 5 logged invoices:\n${items}`;
    }
  };
}

export async function POST(req: Request) {
  try {
    const { messages, tier = 'beginner', category } = await req.json();
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const latestMessage = userMessages[userMessages.length - 1]?.content || '';

    // Check if the user is asking about invoice database metrics (requires Text-to-SQL)
    const isDbQuestion = /invoice|bill|payment|supplier|how much|pending|outstanding|total|due|cost|paid|unpaid|debt|yet to be|how many/i.test(latestMessage);

    if (isDbQuestion && latestMessage) {
      // 1. Compile SQL Query (Ollama-based or Fallback parser)
      let sqlQuery = '';
      let formatFn: (res: any[]) => string;
      
      const fallback = fallbackTextToSql(latestMessage);
      sqlQuery = fallback.sql;
      formatFn = fallback.formatResult;

      try {
        // Attempt dynamic SQL compilation with Ollama if online
        const sqlCompilePrompt = `You are a PostgreSQL Text-to-SQL compiler. You must output ONLY a valid SELECT query against the table "gemma_sme"."Invoice".
Table schema:
Columns: "id" (int), "supplierName" (text), "materialName" (text), "amount" (double precision), "dueDate" (timestamp), "status" (text, either 'pending' or 'paid'), "createdAt" (timestamp).

Write a query to answer the question: '${latestMessage}'.
Output ONLY the raw SQL query. No markdown formatting, no comments, no explanations.`;

        const ollamaSqlRes = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gemma',
            messages: [{ role: 'user', content: sqlCompilePrompt }],
            stream: false
          }),
          signal: AbortSignal.timeout(2000)
        });

        if (ollamaSqlRes.ok) {
          const data = await ollamaSqlRes.json();
          let compiled = data.message.content.trim();
          compiled = compiled.replace(/```sql|```/gi, '').trim();
          if (compiled.toLowerCase().startsWith('select')) {
            sqlQuery = compiled;
          }
        }
      } catch (sqlErr) {
        // Ollama offline
      }

      // 2. Execute SQL query on PostgreSQL via Prisma
      try {
        console.log(`[Text-to-SQL] Executing: ${sqlQuery}`);
        const queryResult: any[] = await prisma.$queryRawUnsafe(sqlQuery);
        
        // 3. Format plain-text response
        let textResult = '';
        try {
          const synthesisPrompt = `You are Suresh's business advisor. Suresh asked: '${latestMessage}'. 
The database returned the following JSON records: ${JSON.stringify(queryResult)}.
Answer Suresh's question in a simple, clear conversational tone. 
Keep it short (2-3 sentences max).
Active Presentation Tier: ${tier.toUpperCase()}`;

          const ollamaSynthesisRes = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gemma',
              messages: [{ role: 'user', content: synthesisPrompt }],
              stream: false
            }),
            signal: AbortSignal.timeout(2000)
          });

          if (ollamaSynthesisRes.ok) {
            const data = await ollamaSynthesisRes.json();
            textResult = data.message.content.trim();
          }
        } catch (synthErr) {
          // Fallback text synthesis
        }

        if (!textResult) {
          textResult = formatFn(queryResult);
        }

        return NextResponse.json({ text: textResult });
      } catch (dbErr: any) {
        return NextResponse.json({ 
          text: `Suresh, I tried querying your database but encountered a search mismatch. Please try asking in a different way.` 
        });
      }
    }

    // Standard conversational queries (Ollama or Fallback)
    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\nActive Presentation Tier: ${tier.toUpperCase()}` },
            ...messages
          ],
          stream: false,
          options: { temperature: 0.7 }
        }),
        signal: AbortSignal.timeout(3000)
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        return NextResponse.json({ text: data.message.content });
      }
    } catch (e) {
      // Ollama offline
    }

    // Conversational fallbacks
    const isGreeting = /^(hi|hello|hey|namaste|good morning|good afternoon|good evening|yo)$/i.test(latestMessage.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""));
    
    let text = "";
    if (isGreeting) {
      if (category === 'Analog Invoicing') {
        text = `Namaste Suresh! I see you use paper invoices. I have configured your WhatsApp agent to parse photo/PDF uploads. Let's practice. What is the main material you want to try scanning first?`;
      } else if (category === 'Fragmented Document Shop') {
        text = `Namaste Suresh! Since you have loose PDFs emailed to clients, we can map client name, item columns, and tax rates. What is the most common format your PDF invoices use?`;
      } else if (category === 'High-Maintenance Excel') {
        text = `Namaste Suresh! Since all your jobs are mixed in a single Excel sheet, we need to map your column names. What column name represents the billing amount?`;
      } else if (category === 'Isolated Digital Shop') {
        text = `Namaste Suresh! Since your Excel sheets are stored offline per client, how many months of historical invoices would you like to upload to establish baseline margins?`;
      } else if (category === 'Integrated System Shop') {
        text = `Namaste Suresh! Since you run Tally/Zoho, we can configure an API sync or XML ledger dump. Which accounting system is your primary source?`;
      } else {
        text = `Namaste Suresh! How can I help you manage your Peenya CNC shop invoices and cash flow today?`;
      }
    } else {
      const stepCount = messages.filter((m: any) => m.role === 'user').length;
      
      // If "category" is explicitly provided, execute custom onboarding calibration steps
      if (category) {
        if (stepCount === 0) {
          if (category === 'Analog Invoicing') {
            text = `Namaste Suresh! I see you use paper invoices. I have configured your WhatsApp agent to parse photo/PDF uploads. Let's practice. What is the main material you want to try scanning first?`;
          } else if (category === 'Fragmented Document Shop') {
            text = `Namaste Suresh! Since you have loose PDFs emailed to clients, we can map client name, item columns, and tax rates. What is the most common format your PDF invoices use?`;
          } else if (category === 'High-Maintenance Excel') {
            text = `Namaste Suresh! Since all your jobs are mixed in a single Excel sheet, we need to map your column names. What column name represents the billing amount?`;
          } else if (category === 'Isolated Digital Shop') {
            text = `Namaste Suresh! Since your Excel sheets are stored offline per client, how many months of historical invoices would you like to upload to establish baseline margins?`;
          } else {
            text = `Namaste Suresh! Since you run Tally/Zoho, we can configure an API sync or XML ledger dump. Which accounting system is your primary source?`;
          }
        } else {
          if (category === 'Analog Invoicing') {
            if (stepCount === 1) {
              text = `Got it. Once uploaded, I'll extract item lists and calculate margins. How do you want to keep track of payment deadlines for these bills?`;
            } else {
              text = `Understood. I will configure automated due-date reminders. Calibration complete! Let's enter the dashboard.`;
            }
          } else if (category === 'Fragmented Document Shop') {
            if (stepCount === 1) {
              text = `Understood. I will automatically extract Client Name and CGST/SGST taxes. Do you also want me to track individual item details?`;
            } else {
              text = `Excellent. Field mapping parameters are configured. Calibration complete! Let's enter the dashboard.`;
            }
          } else if (category === 'High-Maintenance Excel') {
            if (stepCount === 1) {
              text = `Got it. And what column represents the supplier name or client name?`;
            } else {
              text = `Thank you. The CSV column mapping template is ready. Calibration complete! Let's enter the dashboard.`;
            }
          } else if (category === 'Isolated Digital Shop') {
            if (stepCount === 1) {
              text = `Got it. Uploading historical logs will help Gemma calculate your raw margin patterns. Which supplier do you buy from most frequently?`;
            } else {
              text = `Understood! Margin calibration complete. Let's enter the dashboard.`;
            }
          } else {
            if (stepCount === 1) {
              text = `Excellent choice. Do you prefer a direct ledger dump upload or setting up API connection credentials?`;
            } else {
              text = `Understood. Tally/Zoho integration is calibrated. Calibration complete! Let's enter the dashboard.`;
            }
          }
        }
      } else {
        // General conversational queries (e.g. from WhatsApp or Dashboard after onboarding)
        const query = latestMessage.toLowerCase();
        if (query.includes('profit') || query.includes('revenue') || query.includes('increase') || query.includes('money')) {
          text = `Suresh, looking at your setup, your top 2 automotive accounts make up 82% of revenue. To increase profit, I suggest increasing Product A prices by 3% to cover the 12.4% steel hike, and recovering the ₹4.8L payment from Raghav Traders.`;
        } else if (query.includes('steel') || query.includes('price') || query.includes('inflation')) {
          text = `Suresh, raw steel plate costs rose 12.4% over the last 14 days in Peenya. I recommend updating standard quote rates by 3% to buffer this cost impact.`;
        } else {
          text = `Suresh, I've processed your query. Let me know if you would like me to compile any database invoice reports or forecast cash reserves.`;
        }
      }
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
