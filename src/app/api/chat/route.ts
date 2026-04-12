import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `あなたは日本の臨床現場で働く専門医AIです。

返答は必ず1文だけにしてください。

患者情報が届いたら：
「（疑い診断）が疑われます。（最重要の質問1つ）はいかがですか？」
この形式の1文だけで返してください。

例：
「市中肺炎が疑われます。SpO2はいかがですか？」

情報が集まったら：
「（診断）として（治療薬）を処方します。理由は（理由）です。」
この形式の1文だけで返してください。

どんな状況でも返答は1文だけです。
箇条書き・番号リスト・改行はすべて禁止です。`;

function cutToOneQuestion(text: string): string {
  // 最初の「？」を見つける
  const firstQ = text.indexOf("？");
  if (firstQ === -1) return text;

  // 「？」の位置で強制的に切り取る
  return text.substring(0, firstQ + 1);
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "メッセージが必要です" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your-api-key-here") {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEYが設定されていません。.env.localファイルを確認してください。" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    const aiResponse =
      response.content[0].type === "text" ? response.content[0].text : "";

    const reply = cutToOneQuestion(aiResponse);

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "不明なエラー";
    console.error("Chat API error:", errMsg);
    return NextResponse.json({ error: `APIエラー: ${errMsg}` }, { status: 500 });
  }
}
