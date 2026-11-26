import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing or invalid audio file" }, { status: 400 });
    }

    // Prepare multipart form data for Groq Whisper API
    const groqFormData = new FormData();
    groqFormData.append("model", "whisper-large-v3-turbo");
    groqFormData.append("file", file, "audio.webm");
    groqFormData.append("language", "en");
    groqFormData.append("response_format", "json");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "ArchonVoice/1.0",
      },
      body: groqFormData,
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("[Groq Whisper STT Error]", groqResponse.status, errText);
      return NextResponse.json(
        { error: `Transcription failed: ${groqResponse.statusText}` },
        { status: groqResponse.status }
      );
    }

    const data = await groqResponse.json();
    return NextResponse.json({ text: data.text?.trim() || "" });
  } catch (err: unknown) {
    console.error("[Voice Transcribe Route Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
