"use client";

import { useState } from "react";

// ============================================================
// Hunt & Hess Classification
// ============================================================
function HuntHess() {
  const [grade, setGrade] = useState<number | null>(null);

  const grades = [
    { grade: 1, desc: "無症状、または軽度の頭痛・項部硬直", mortality: "約1%", risk: "low" },
    { grade: 2, desc: "中等度〜重度の頭痛、項部硬直、脳神経麻痺以外の局所症状なし", mortality: "約5%", risk: "low" },
    { grade: 3, desc: "傾眠、混迷、軽度の局所症状", mortality: "約15-20%", risk: "mid" },
    { grade: 4, desc: "昏迷、中等度〜重度の片麻痺、除脳硬直初期", mortality: "約30-40%", risk: "high" },
    { grade: 5, desc: "深昏睡、除脳硬直、瀕死状態", mortality: "約50-70%", risk: "high" },
  ];

  return (
    <div>
      <h3 className="font-bold text-sm text-slate-700 mb-3">Grade を選択</h3>
      <div className="space-y-2">
        {grades.map((g) => (
          <button
            key={g.grade}
            onClick={() => setGrade(g.grade)}
            className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
              grade === g.grade
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-800">Grade {g.grade}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                g.risk === "low" ? "bg-green-100 text-green-700" :
                g.risk === "mid" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                死亡率 {g.mortality}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">{g.desc}</p>
          </button>
        ))}
      </div>
      {grade !== null && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-sm font-bold text-blue-800">判定: Hunt & Hess Grade {grade}</p>
          <p className="text-xs text-blue-600 mt-1">
            {grade <= 3
              ? "手術適応を積極的に検討。早期クリッピングまたはコイル塞栓術を考慮。"
              : "手術適応は慎重に判断。全身状態の安定化を優先。"}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// GCS Score
// ============================================================
function GCSCalculator() {
  const [e, setE] = useState(0);
  const [v, setV] = useState(0);
  const [m, setM] = useState(0);

  const eyeOptions = [
    { val: 4, label: "自発的に開眼 (E4)" },
    { val: 3, label: "呼びかけで開眼 (E3)" },
    { val: 2, label: "痛み刺激で開眼 (E2)" },
    { val: 1, label: "開眼しない (E1)" },
  ];
  const verbalOptions = [
    { val: 5, label: "見当識あり (V5)" },
    { val: 4, label: "混乱した会話 (V4)" },
    { val: 3, label: "不適切な言葉 (V3)" },
    { val: 2, label: "理解不能な音 (V2)" },
    { val: 1, label: "発語なし (V1)" },
  ];
  const motorOptions = [
    { val: 6, label: "命令に従う (M6)" },
    { val: 5, label: "疼痛部へ (M5)" },
    { val: 4, label: "逃避反応 (M4)" },
    { val: 3, label: "異常屈曲 (M3)" },
    { val: 2, label: "伸展反応 (M2)" },
    { val: 1, label: "運動なし (M1)" },
  ];

  const total = e + v + m;

  const getSeverity = (score: number) => {
    if (score === 0) return { label: "未選択", color: "bg-slate-100 text-slate-500" };
    if (score >= 13) return { label: "軽症", color: "bg-green-100 text-green-700" };
    if (score >= 9) return { label: "中等症", color: "bg-yellow-100 text-yellow-700" };
    return { label: "重症", color: "bg-red-100 text-red-700" };
  };

  const severity = getSeverity(total);

  const renderGroup = (
    label: string,
    options: { val: number; label: string }[],
    selected: number,
    setter: (v: number) => void
  ) => (
    <div className="mb-3">
      <p className="text-xs font-semibold text-slate-500 mb-1.5">{label}</p>
      <div className="space-y-1">
        {options.map((opt) => (
          <button
            key={opt.val}
            onClick={() => setter(opt.val)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              selected === opt.val
                ? "bg-blue-600 text-white"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="sticky top-0 bg-white pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-blue-800">{total || "-"}</span>
            <span className="text-sm text-slate-400 ml-1">/ 15</span>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${severity.color}`}>
            {severity.label}
          </span>
        </div>
        {total >= 3 && total <= 8 && (
          <p className="text-xs text-red-600 mt-1">気管挿管を考慮してください</p>
        )}
      </div>
      {renderGroup("開眼 (Eye)", eyeOptions, e, setE)}
      {renderGroup("言語 (Verbal)", verbalOptions, v, setV)}
      {renderGroup("運動 (Motor)", motorOptions, m, setM)}
    </div>
  );
}

// ============================================================
// NIHSS Score
// ============================================================
function NIHSSCalculator() {
  const items = [
    { name: "1a. 意識水準", options: ["清明 (0)", "簡単な刺激で覚醒 (1)", "反復刺激で覚醒 (2)", "反応なし (3)"] },
    { name: "1b. 意識障害-質問", options: ["両方正解 (0)", "片方正解 (1)", "両方不正解 (2)"] },
    { name: "1c. 意識障害-従命", options: ["両方可 (0)", "片方可 (1)", "両方不可 (2)"] },
    { name: "2. 最良の注視", options: ["正常 (0)", "部分的注視麻痺 (1)", "完全注視麻痺 (2)"] },
    { name: "3. 視野", options: ["視野欠損なし (0)", "部分的半盲 (1)", "完全半盲 (2)", "両側半盲 (3)"] },
    { name: "4. 顔面麻痺", options: ["正常 (0)", "軽度 (1)", "部分的 (2)", "完全麻痺 (3)"] },
    { name: "5a. 左上肢", options: ["下垂なし (0)", "下垂 (1)", "重力に抗せず (2)", "全く動かない (3)", "運動なし (4)"] },
    { name: "5b. 右上肢", options: ["下垂なし (0)", "下垂 (1)", "重力に抗せず (2)", "全く動かない (3)", "運動なし (4)"] },
    { name: "6a. 左下肢", options: ["下垂なし (0)", "下垂 (1)", "重力に抗せず (2)", "全く動かない (3)", "運動なし (4)"] },
    { name: "6b. 右下肢", options: ["下垂なし (0)", "下垂 (1)", "重力に抗せず (2)", "全く動かない (3)", "運動なし (4)"] },
    { name: "7. 運動失調", options: ["なし (0)", "1肢 (1)", "2肢 (2)"] },
    { name: "8. 感覚", options: ["正常 (0)", "軽度〜中等度 (1)", "重度〜完全 (2)"] },
    { name: "9. 最良の言語", options: ["正常 (0)", "軽度〜中等度 (1)", "重度 (2)", "無言・全失語 (3)"] },
    { name: "10. 構音障害", options: ["正常 (0)", "軽度〜中等度 (1)", "重度 (2)"] },
    { name: "11. 消去・無視", options: ["なし (0)", "1種類 (1)", "2種類以上 (2)"] },
  ];

  const [scores, setScores] = useState<number[]>(new Array(items.length).fill(-1));

  const total = scores.reduce((sum, s) => sum + (s >= 0 ? s : 0), 0);
  const allSelected = scores.every((s) => s >= 0);

  return (
    <div>
      <div className="sticky top-0 bg-white pb-3 mb-3 border-b border-slate-100 z-10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-blue-800">{allSelected ? total : "-"}</span>
            <span className="text-sm text-slate-400 ml-1">/ 42</span>
          </div>
          {allSelected && (
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              total <= 4 ? "bg-green-100 text-green-700" :
              total <= 15 ? "bg-yellow-100 text-yellow-700" :
              total <= 25 ? "bg-orange-100 text-orange-700" :
              "bg-red-100 text-red-700"
            }`}>
              {total <= 4 ? "軽症" : total <= 15 ? "中等症" : total <= 25 ? "重症" : "最重症"}
            </span>
          )}
        </div>
        {allSelected && total >= 5 && total <= 25 && (
          <p className="text-xs text-amber-700 mt-1">
            tPA静注療法の適応を検討（発症4.5時間以内）
          </p>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx}>
            <p className="text-xs font-semibold text-slate-600 mb-1">{item.name}</p>
            <div className="flex flex-wrap gap-1">
              {item.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => {
                    const next = [...scores];
                    next[idx] = optIdx;
                    setScores(next);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    scores[idx] === optIdx
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Fisher Grade
// ============================================================
function FisherGrade() {
  const [grade, setGrade] = useState<number | null>(null);

  const grades = [
    { grade: 1, desc: "CT上出血を認めない", spasm: "低い（21%）", risk: "low" },
    { grade: 2, desc: "びまん性のSAH、1mm未満の薄い層", spasm: "低い（25%）", risk: "low" },
    { grade: 3, desc: "局所の血腫 or 1mm以上の厚い層", spasm: "高い（37%）", risk: "high" },
    { grade: 4, desc: "脳室内血腫 or 脳内血腫を伴うびまん性SAH", spasm: "低い（31%）", risk: "mid" },
  ];

  return (
    <div>
      <h3 className="font-bold text-sm text-slate-700 mb-3">CT所見からGradeを選択</h3>
      <div className="space-y-2">
        {grades.map((g) => (
          <button
            key={g.grade}
            onClick={() => setGrade(g.grade)}
            className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
              grade === g.grade
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-800">Grade {g.grade}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                g.risk === "low" ? "bg-green-100 text-green-700" :
                g.risk === "mid" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                攣縮リスク {g.spasm}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">{g.desc}</p>
          </button>
        ))}
      </div>
      {grade !== null && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-sm font-bold text-blue-800">判定: Fisher Grade {grade}</p>
          <p className="text-xs text-blue-600 mt-1">
            {grade === 3
              ? "血管攣縮のリスクが最も高いグレードです。経頭蓋ドプラでの厳重なモニタリングと予防的治療を検討してください。"
              : grade === 4
              ? "脳室内・脳内出血を伴います。脳室ドレナージの適応を検討してください。"
              : "血管攣縮リスクは比較的低いですが、経過観察は必要です。"}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Calculator Tab
// ============================================================
const calculators = [
  { id: "hh", name: "Hunt & Hess", subtitle: "くも膜下出血重症度", component: HuntHess },
  { id: "gcs", name: "GCS", subtitle: "意識障害評価", component: GCSCalculator },
  { id: "nihss", name: "NIHSS", subtitle: "脳卒中重症度", component: NIHSSCalculator },
  { id: "fisher", name: "Fisher", subtitle: "SAH CT分類", component: FisherGrade },
];

export default function CalculatorTab() {
  const [active, setActive] = useState<string | null>(null);

  if (active) {
    const calc = calculators.find((c) => c.id === active)!;
    const Component = calc.component;
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <button
            onClick={() => setActive(null)}
            className="text-blue-700 hover:text-blue-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
          </button>
          <div>
            <h2 className="font-bold text-sm text-slate-800">{calc.name}</h2>
            <p className="text-[10px] text-slate-400">{calc.subtitle}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Component />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="font-bold text-base text-slate-800 mb-1">臨床計算ツール</h2>
      <p className="text-xs text-slate-400 mb-4">スコアリングシステムを選択</p>
      <div className="grid grid-cols-2 gap-3">
        {calculators.map((calc) => (
          <button
            key={calc.id}
            onClick={() => setActive(calc.id)}
            className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
                <path fillRule="evenodd" d="M6.32 1.827a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V19.5a3 3 0 01-3 3H6.75a3 3 0 01-3-3V4.757c0-1.47 1.073-2.756 2.57-2.93zM7.5 11.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H8.25a.75.75 0 01-.75-.75v-.008zm.75 1.5a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75H8.25z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-bold text-sm text-slate-800">{calc.name}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{calc.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
