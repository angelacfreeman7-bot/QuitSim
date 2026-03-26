import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You parse natural language descriptions of someone's financial situation and dream
into structured financial data. Extract what you can, use reasonable defaults for the rest.

Output JSON:
{
  "salary": 85000,
  "savings": 30000,
  "monthlyExpenses": 3500,
  "investments": 15000,
  "debt": 0,
  "dream": "short summary of their dream",
  "suggestedParams": {
    "incomeDropPct": 100,
    "newMonthlyIncome": 0,
    "additionalExpenses": 0
  }
}

Defaults if not mentioned:
- salary: 75000
- savings: 20000
- monthlyExpenses: 3000
- investments: 10000
- debt: 0`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        salary: 85000,
        savings: 30000,
        monthlyExpenses: 3500,
        investments: 15000,
        debt: 0,
        dream: text || "Financial freedom",
        suggestedParams: {
          incomeDropPct: 100,
          newMonthlyIncome: 0,
          additionalExpenses: 0,
        },
      });
    }

    const baseUrl = process.env.GROK_API_KEY
      ? "https://api.x.ai/v1"
      : "https://api.openai.com/v1";
    const model = process.env.GROK_API_KEY ? "grok-2-latest" : "gpt-4o-mini";

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse" },
      { status: 500 }
    );
  }
}
