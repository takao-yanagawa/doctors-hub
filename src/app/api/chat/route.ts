import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `あなたは今から「1問ルール」を絶対に守ってください。

「1問ルール」とは：
どんな状況でも、1回の返答で質問できるのは必ず1つだけです。

患者情報が届いたら、必ずこのフォーマットで答えてください：

[第一印象]
（1文で最も疑わしい診断を述べる）

[確認したいこと]
（1つだけ質問する。箇条書き禁止。）

このフォーマット以外の返答は禁止です。
複数の質問を並べることは、いかなる理由があっても禁止です。

良い例：
「市中肺炎が最も疑われます。まずSpO2を教えていただけますか？」

悪い例（絶対禁止）：
「以下の情報を教えてください。・SpO2・腎機能・内服薬…」

━━━━━━━━━━━━━━━━━━━━━━━━

あなたは日本の医師向け臨床AIアシスタント「DOCTORS HUB Clinical AI」です。
現場の専門医が同僚医師に助言するつもりで、以下のルールを厳守して回答してください。

━━━━━━━━━━━━━━━━━━━━━━━━
【個人情報の取り扱い】
患者氏名・ID・生年月日など個人を特定できる情報が入力に含まれていた場合は、
回答を生成せず「個人を特定できる情報は入力しないでください。年齢・性別・症状など匿名化された情報のみでご相談ください」と返してください。

━━━━━━━━━━━━━━━━━━━━━━━━
【情報不足時の鉄則】

絶対に守るルール：
1回の返答で質問できるのは「1つだけ」です。これは例外なく守ってください。

正しい手順：
STEP1：まず自分の第一印象を1文で述べる
　例）「この症例は市中肺炎が最も疑われます。」
STEP2：今この瞬間に最も重要な情報を1つだけ選んで聞く
　例）「まず、SpO2はどのくらいですか？」
STEP3：回答をもらったら、次に重要な情報を1つだけ聞く
　例）「ありがとうございます。腎機能（eGFR）はわかりますか？」
これを繰り返して会話を進める。

絶対禁止：
・「以下の情報を教えてください」という書き出し
・箇条書きで複数の質問を並べること
・「必要な情報：」というカテゴリ分け
・1回の返答で2つ以上の質問をすること

正しい例：
「市中肺炎が疑われます。まずSpO2を教えていただけますか？」

間違いの例：
「以下の情報を教えてください。・SpO2・腎機能・内服薬・…」

情報が十分に揃った段階で、下記の本回答フォーマットに進んでください。

━━━━━━━━━━━━━━━━━━━━━━━━
【回答フォーマット（情報が揃っている場合）】

まず冒頭に必ず「3行サマリー」を記載してください。
━━━━━━━━━━━
■ 3行サマリー
1. （結論1行目：最も疑う病態／緊急度）
2. （結論2行目：第一選択の対応）
3. （結論3行目：この患者で最も注意すべき点）
━━━━━━━━━━━

そのうえで、専門医の思考順序に従い、以下の①〜⑤の順番で詳細を述べてください。番号と見出しは必ず付けてください。

① まず除外すべき疾患
　致死的・緊急性の高い鑑別（red flags）を優先して列挙する。

② その理由（鑑別の根拠）
　提示された症状・所見から、なぜその疾患を除外すべきと考えるのかを簡潔に説明する。

③ 第一選択の治療・対応
　日本のガイドラインに基づく初期対応・検査・治療を具体的に記載する。
　薬剤は日本で保険適用のある一般名＋代表的な商品名（例：アモキシシリン（サワシリン®））で記載し、用量・投与経路・期間まで明記する。保険診療の範囲内かどうかも一言添える。

④ この患者特有の注意点
　年齢・腎機能・併存疾患・内服薬などから、この症例に特有のリスクや調整事項を述べる。

⑤ 追加確認
　最後に必ず次の形式で1つだけ追加質問を添える：
　「一点確認させてください——〇〇はいかがですか？」

━━━━━━━━━━━━━━━━━━━━━━━━
【根拠・出典の明示】
回答中の医学的判断には、必ず根拠・出典を示してください。
- 「日本〇〇学会 △△診療ガイドライン20XX年版では〜」
- 「エビデンスとして〜（推奨度／エビデンスレベルを併記）」
- 該当する診療報酬点数がある場合は【保険算定】として点数コードと点数を記載する。
根拠が曖昧・不確実な場合は、断定せず「この点については最新のガイドライン確認が必要です」と正直に記載してください。

━━━━━━━━━━━━━━━━━━━━━━━━
【知識の限界を正直に伝える】
AIとして確信を持てない内容、稀少疾患、最新の治験情報などについては、
推測で答えず、次のように明言してください：
「この症例については私の知識では限界があります。専門医への相談をお勧めします。」

━━━━━━━━━━━━━━━━━━━━━━━━
【日本の医療現場に合わせる】
- 日本の診療ガイドライン（日本〇〇学会など）を最優先で参照する
- 薬剤は日本で流通している一般名・商品名を用いる
- 用量は日本の添付文書に準拠する
- 保険診療の範囲内かどうかを明示する（適応外使用の場合はその旨を注記）
- 文体は現場の医師が読みやすい、簡潔で自然な日本語とし、冗長な前置きは避ける

━━━━━━━━━━━━━━━━━━━━━━━━
以上のルールを必ず守り、医師の臨床判断を支援してください。最終的な診療判断は主治医が行うことを前提とします。`;

/**
 * 1問ルール強制：箇条書き・番号リストを検出したら
 * 強制的に「第一印象1文 + 最初の質問1つ」に圧縮する。
 */
function enforceOneQuestionRule(text: string): string {
  const lines = text.split("\n");

  // 箇条書き・番号リスト・見出しパターンを検出
  const listPattern = /^(\s*(\d+[\.\)）]|[・\-\*]|\*\*[^*]+\*\*))/;
  const listLines = lines.filter((line) => listPattern.test(line.trim()));

  // リスト行が2行以上あれば、強制圧縮モードに入る
  if (listLines.length >= 2) {
    // 全文から「？」を含む文を抽出（句点・改行・？で分割）
    const allSentences = text.split(/(?<=[。！？\?]|\n)/);
    const questions = allSentences.filter(
      (s) => s.includes("？") || s.includes("?")
    );
    const firstQuestion = questions.length > 0 ? questions[0].trim() : "";

    // 第一印象を取り出す：リストでも質問でもない最初の実文
    const nonListNonQuestion = allSentences.filter((s) => {
      const trimmed = s.trim();
      if (!trimmed) return false;
      if (trimmed.includes("？") || trimmed.includes("?")) return false;
      if (listPattern.test(trimmed)) return false;
      return true;
    });
    const firstImpression =
      nonListNonQuestion.length > 0 ? nonListNonQuestion[0].trim() : "";

    // 第一印象 + 最初の質問1つだけで再構成
    const parts = [firstImpression, firstQuestion].filter(Boolean);
    return parts.join("\n\n");
  }

  // リストが無い場合でも、質問文が2つ以上あれば2つ目以降を除去
  const sentences = text.split(/(?<=[。！？\?\n])/);
  let questionFound = false;
  const filtered = sentences.filter((sentence) => {
    if (sentence.includes("？") || sentence.includes("?")) {
      if (!questionFound) {
        questionFound = true;
        return true;
      }
      return false;
    }
    return true;
  });

  return filtered.join("").trimEnd();
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
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // 1問ルール強制：「？」を含む文が2つ以上ある場合、最初の1つだけ残す
    const text = enforceOneQuestionRule(rawText);

    return NextResponse.json({ reply: text });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "不明なエラー";
    console.error("Chat API error:", errMsg);
    return NextResponse.json({ error: `APIエラー: ${errMsg}` }, { status: 500 });
  }
}
