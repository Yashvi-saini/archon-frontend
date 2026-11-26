import { NextRequest, NextResponse } from "next/server";

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "") // remove multi-line code blocks
    .replace(/`([^`]+)`/g, "$1") // unwrap inline backticks
    .replace(/\[STAGE:[^\]]*\]/gi, "") // strip stage tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // unwrap markdown links
    .replace(/[#*_~>|\\]/g, "") // remove markdown syntax chars
    .replace(/{[\s\S]*?}/g, "") // remove inline json snippets
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const rawKeys = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS;
    const apiKey = rawKeys?.split(",")[0]?.trim();

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const body = await req.json();
    const rawText = body.text;
    const voiceName = body.voice || "Puck"; // High-clarity conversational neural interviewer voice

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json({ error: "Missing or invalid text parameter" }, { status: 400 });
    }

    const cleanText = cleanTextForSpeech(rawText);
    if (!cleanText) {
      return NextResponse.json({ audio: null });
    }

    // Call Gemini 2.5 Flash Preview TTS
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: cleanText }],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName,
              },
            },
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[Gemini TTS Error]", geminiRes.status, errText);
      return NextResponse.json(
        { error: `Gemini TTS failed: ${geminiRes.statusText}` },
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();
    const part = data.candidates?.[0]?.content?.parts?.[0];
    const inlineData = part?.inlineData;

    if (!inlineData?.data) {
      return NextResponse.json({ error: "No audio data returned by model" }, { status: 500 });
    }

    return NextResponse.json({
      audio: inlineData.data, // base64 encoded PCM L16
      mimeType: inlineData.mimeType || "audio/L16;codec=pcm;rate=24000",
      sampleRate: 24000,
    });
  } catch (err: unknown) {
    console.error("[Voice Synthesize Route Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
