import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `あなたは日本の臨床現場で働く専門医AIです。

【絶対ルール】
返答は必ず1文だけにしてください。
箇条書き・番号リスト・改行はすべて禁止です。

【会話の進め方】
以下の情報がすべて揃うまで、1つずつ質問を続けてください。
絶対に治療方針を出してはいけません。

必須確認項目：
1. SpO2
2. 腎機能（eGFRまたはCr値）
3. 現在の内服薬
4. 外来か入院か

上記4つが全部揃ったら初めて治療方針を述べてください。

【返答フォーマット】
情報収集中：
「（疑い診断）が疑われます。（質問1つ）はいかがですか？」

情報が揃ったとき：
「（診断）として（治療薬・用量）を処方します。理由は（理由）です。」

【例】
1回目：「市中肺炎が疑われます。SpO2はいかがですか？」
2回目：「ありがとうございます。腎機能（eGFR）はいかがですか？」
3回目：「現在の内服薬を教えていただけますか？」
4回目：「外来での治療を想定していますか？」
5回目：「〇〇として△△を処方します。理由は□□です。」`;

function cutToOneQuestion(text: string): string {
  // 最初の「？」を見つける
  const firstQ = text.indexOf("？");
  if (firstQ === -1) return text;

  // 「？」の位置で強制的に切り取る
  return text.substring(0, firstQ + 1);
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "メッセージが必要です" }, { status: 400 });
    }

    // 過去の会話履歴を構築（フロントエンドから受け取る）
    const conversationHistory: { role: "user" | "assistant"; content: string }[] =
      Array.isArray(history)
        ? history.filter(
            (m: { role: string; content: string }) =>
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string"
          )
        : [];

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
      messages: [...conversationHistory, { role: "user" as const, content: message }],
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
