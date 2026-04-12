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

情報収集中の最初の返答：
「最も疑うのは（第一診断）ですが、（見落としてはいけない鑑別疾患1）や（見落としてはいけない鑑別疾患2）も除外が必要です。まず（質問1つ）はいかがですか？」

情報収集中の2回目以降：
「ありがとうございます。（質問1つ）はいかがですか？」

情報が4つ揃ったとき：
ガイドライン上で同等の選択肢が複数ある場合はすべて並列で提示してください。
「（診断）として、以下のいずれかを選択します。①（治療薬A・用量）②（治療薬B・用量）今回はeGFR・内服薬・重症度を考慮すると（推奨理由）のため①または②が適切です。」

【鑑別診断のルール】
症状から最初の診断を述べるときは、必ず「絶対に見落としてはいけない疾患」を同時に1〜3つ挙げてください。
例：発熱＋咳なら→ 第一診断：市中肺炎→ 除外必須：肺結核、肺癌、心不全の急性増悪

【治療薬提示のルール】
日本のガイドラインで同等の推奨度の薬剤が複数ある場合は、必ず全て並列で提示してください。
1つに絞るのは最後の最後、患者背景を考慮した上でのみ行ってください。

【市中肺炎の治療薬選択ルール】

糖尿病・COPD・心不全などの併存疾患がある外来CAPの場合：

推奨（必ず3つすべてを提示すること）：
①呼吸器フルオロキノロン単剤（レボフロキサシン500mg 1日1回）
②βラクタム＋マクロライド併用（アモキシシリン/クラブラン酸875mg＋クラリスロマイシン400mg）
③βラクタム＋ドキシサイクリン併用（アモキシシリン/クラブラン酸875mg＋ドキシサイクリン100mg）

この3択を必ず並列で提示し、患者背景を考慮して最終的にどれが適切かを述べること。

提示してはいけない選択肢：
・βラクタム単剤（非定型カバー不足のため）
・マクロライド単剤（耐性率の問題のため）

併存疾患なしの軽症外来CAPの場合のみ：
・βラクタム単剤またはマクロライド単剤が選択肢になる

レボフロキサシン使用時は必ず付記：
副作用（腱障害・血糖異常・QT延長）に注意`;

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
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [...conversationHistory, { role: "user" as const, content: message }],
    });

    const aiResponse =
      response.content[0].type === "text" ? response.content[0].text : "";

    // 治療方針の返答かどうかを判定（処方・選択・投与などの治療キーワードを含む）
    const treatmentKeywords = ["処方", "選択します", "投与", "適切です"];
    const isTreatment = treatmentKeywords.some((kw) => aiResponse.includes(kw));

    // 情報収集中の返答のみcutToOneQuestionを適用、治療方針はそのまま返す
    const reply = isTreatment ? aiResponse : cutToOneQuestion(aiResponse);

    return NextResponse.json({ reply, isTreatment });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "不明なエラー";
    console.error("Chat API error:", errMsg);
    return NextResponse.json({ error: `APIエラー: ${errMsg}` }, { status: 500 });
  }
}
