import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai-client";
import { VERDICT_PROMPT } from "@/lib/ai-prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ipoName,
      market,
      exchange,
      sector,
      priceRange,
      issueSize,
      description,
      status,
      listingPrice,
    } = body;

    if (!ipoName) {
      return NextResponse.json(
        { error: "IPO name is required" },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();

    if (!client) {
      return NextResponse.json(
        {
          error:
            "AI verdicts require an Anthropic API key. Please add ANTHROPIC_API_KEY to your .env.local file.",
        },
        { status: 503 }
      );
    }

    // Build the prompt with all available IPO data
    const prompt = VERDICT_PROMPT.replace("{ipoName}", ipoName || "Unknown")
      .replace("{market}", market === "india" ? "Indian" : "US")
      .replace("{exchange}", exchange || "N/A")
      .replace("{priceRange}", priceRange || "N/A")
      .replace("{issueSize}", issueSize || "N/A")
      .replace("{sector}", sector || "N/A")
      .replace("{description}", description || "No description available")
      .replace("{status}", status || "unknown")
      .replace("{listingPrice}", listingPrice || "Not yet listed");

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response received from Claude");
    }

    let jsonText = textContent.text.trim();
    // Strip markdown code fences if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const verdict = JSON.parse(jsonText);

    return NextResponse.json(verdict);
  } catch (error) {
    console.error("Verdict generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate verdict";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
