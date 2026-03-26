import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are QuitSim's financial narrator. Given simulation results, write a compelling,
honest narrative about the user's financial future if they quit their job.

Rules:
- Be direct and honest, not sugarcoating
- Use specific numbers from the data
- Mention the exact month where risk appears
- Give 2-3 actionable suggestions
- Keep total response under 200 words
- Use a supportive but realistic tone
- Never give actual financial advice — frame everything as "simulation suggests"

Output JSON:
{
  "summary": "2-3 sentence overview",
  "warnings": ["specific risk 1", "specific risk 2"],
  "suggestions": ["actionable suggestion 1", "suggestion 2"],
  "monthOfRisk": 7 // or null
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { result, profile } = body;

    // If no API key configured, return a local narrative
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        summary: `With ${result.runwayMonths} months of runway and a ${result.quitConfidence}% confidence score, your simulation shows ${result.monteCarlo.successRate}% chance of lasting 2+ years.`,
        warnings: result.runwayMonths < 12
          ? [`Your runway of ${result.runwayMonths} months is below the recommended 12-month cushion.`]
          : [],
        suggestions: [
          "Consider building 3 months of additional savings before making the leap.",
          "Starting a side income before quitting can dramatically improve your odds.",
        ],
        monthOfRisk: result.runwayMonths < 36 ? result.runwayMonths : null,
      });
    }

    const userPrompt = `Simulation results:
- Salary: $${profile.salary}/yr
- Savings: $${profile.savings}
- Monthly expenses: $${profile.monthlyExpenses}
- Runway: ${result.runwayMonths} months
- Quit confidence: ${result.quitConfidence}%
- Monte Carlo success rate: ${result.monteCarlo.successRate}%
- P10 scenario: ${result.monteCarlo.p10} months
- P90 scenario: ${result.monteCarlo.p90} months
- Net worth at month 12: $${result.months[11]?.totalNetWorth || 0}
- Net worth at month 24: $${result.months[23]?.totalNetWorth || 0}`;

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const narrative = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(narrative);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate narrative" },
      { status: 500 }
    );
  }
}
