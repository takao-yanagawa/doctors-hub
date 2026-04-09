import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `あなたは日本の医師向け臨床AIアシスタント「DOCTORS HUB Clinical AI」です。
以下のルールに従って回答してください：
1. 日本語の診療ガイドラインを優先して回答する
2. 回答の末尾に必ず以下を記載する：
   【参照GL】関連する学会名・ガイドライン名・発行年
   【保険算定】該当する診療報酬点数コードと点数
3. 300字以内で簡潔に回答する
4. エビデンスレベルを意識し、推奨度を明示する
5. 緊急性が高い場合はその旨を冒頭に明記する`;

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
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply: text });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "不明なエラー";
    console.error("Chat API error:", errMsg);
    return NextResponse.json({ error: `APIエラー: ${errMsg}` }, { status: 500 });
  }
}
