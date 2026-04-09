"use client";

import { useState } from "react";

interface Medication {
  id: string;
  name: string;
  generic: string;
  category: string;
  dosage: string;
  administration: string;
  contraindications: string[];
  yakkaCode: string;
  yakkaPrice: string;
  notes: string;
}

const medications: Medication[] = [
  {
    id: "nicardipine",
    name: "ニカルジピン（ペルジピン）",
    generic: "ニカルジピン塩酸塩",
    category: "Ca拮抗薬・降圧薬",
    dosage:
      "【静注】0.5〜6μg/kg/min で持続静注。開始: 0.5μg/kg/min → 5分毎に0.5μg/kg/minずつ増量。目標血圧に応じて調整。\n【上限】通常 6μg/kg/min まで。",
    administration:
      "持続静注（シリンジポンプ使用）。ペルジピン注射液 10mg/10mL または 25mg/25mL を生食で希釈。遮光が必要。末梢静脈からも投与可だが血管痛に注意、中心静脈が望ましい。",
    contraindications: [
      "頭蓋内出血の急性期で止血が完成していない場合",
      "高度な大動脈弁狭窄・僧帽弁狭窄",
      "低血圧（収縮期90mmHg未満）",
      "本剤過敏症の既往",
    ],
    yakkaCode: "2149400A1026",
    yakkaPrice: "ペルジピン注射液10mg: 267円/管、25mg: 570円/管",
    notes:
      "脳出血・くも膜下出血の血圧管理に第一選択。半減期が短く微調整が容易。反射性頻脈に注意。",
  },
  {
    id: "mannitol",
    name: "マンニトール（マンニットール）",
    generic: "D-マンニトール",
    category: "浸透圧利尿薬・脳圧降下薬",
    dosage:
      "【脳圧降下】20%マンニトール 1〜2g/kg（5〜10mL/kg）を30分以上かけて点滴静注。通常300〜500mLを1回量。\n【反復投与】6〜8時間毎。血清浸透圧320mOsm/Lを超えないよう管理。",
    administration:
      "20%マンニトール注射液を点滴静注。結晶析出防止のためインラインフィルター使用推奨。低温で結晶化した場合は加温溶解後に使用。配合変化に注意（他剤との混注を避ける）。",
    contraindications: [
      "急性頭蓋内血腫（手術前の緊急減圧を除く）",
      "高度の脱水状態",
      "うっ血性心不全",
      "高度の腎機能障害（無尿）",
      "本剤過敏症の既往",
    ],
    yakkaCode: "3399002A3047",
    yakkaPrice: "マンニットールS注射液300mL: 306円/袋",
    notes:
      "投与後15〜30分で効果発現、2〜4時間持続。リバウンド現象に注意。腎機能・電解質・浸透圧ギャップを定期モニタリング。",
  },
  {
    id: "alteplase",
    name: "アルテプラーゼ（グルトパ/アクチバシン）",
    generic: "アルテプラーゼ（遺伝子組換え）",
    category: "血栓溶解薬（t-PA）",
    dosage:
      "【急性脳梗塞】0.6mg/kg（最大60mg）。総量の10%を1〜2分でIVボーラス、残りを1時間かけて持続静注。\n【発症4.5時間以内】に投与開始すること。",
    administration:
      "専用溶解液で溶解後、静注。グルトパ注600万/1200万/2400万を体重に応じて使用。投与中・投与後24時間は抗凝固薬・抗血小板薬の併用を原則避ける。投与後24時間はICU管理。",
    contraindications: [
      "CTで広範な早期虚血性変化（1/3以上）",
      "発症時刻不明、または4.5時間超",
      "NIHSS 26以上の重症例（相対的禁忌）",
      "血小板10万/μL未満",
      "PT-INR 1.7超、またはAPTT延長",
      "血糖50mg/dL未満",
      "収縮期185mmHg超または拡張期110mmHg超（降圧後は可）",
      "3ヶ月以内の頭蓋内手術・重篤な頭部外傷",
      "消化管出血（21日以内）",
      "大動脈解離の疑い",
    ],
    yakkaCode: "3959403D1022",
    yakkaPrice: "グルトパ注600万: 77,498円/瓶、1200万: 154,996円/瓶、2400万: 309,992円/瓶",
    notes:
      "日本の用量(0.6mg/kg)は海外(0.9mg/kg)より低用量。J-ACT/J-ACT IIに基づく。投与前にNIHSS評価必須。症候性頭蓋内出血の発生率は約3〜6%。",
  },
];

export default function MedicationsTab() {
  const [active, setActive] = useState<string | null>(null);

  if (active) {
    const med = medications.find((m) => m.id === active)!;
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <button onClick={() => setActive(null)} className="text-blue-700 hover:text-blue-900">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
          </button>
          <div>
            <h2 className="font-bold text-sm text-slate-800">{med.name}</h2>
            <p className="text-[10px] text-slate-400">{med.category}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 一般名 */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">一般名</p>
            <p className="text-sm font-medium text-blue-900">{med.generic}</p>
          </div>

          {/* 用量 */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5">用法・用量</p>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{med.dosage}</p>
            </div>
          </div>

          {/* 投与方法 */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5">投与方法</p>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-700 leading-relaxed">{med.administration}</p>
            </div>
          </div>

          {/* 禁忌 */}
          <div>
            <p className="text-xs font-bold text-red-700 mb-1.5">禁忌・注意</p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <ul className="space-y-1.5">
                {med.contraindications.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">&#x2716;</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 薬価 */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5">薬価コード・薬価</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-[10px] text-emerald-600 font-mono mb-1">Code: {med.yakkaCode}</p>
              <p className="text-xs text-emerald-800 font-medium">{med.yakkaPrice}</p>
            </div>
          </div>

          {/* 備考 */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5">臨床メモ</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800 leading-relaxed">{med.notes}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="font-bold text-base text-slate-800 mb-1">薬剤情報</h2>
      <p className="text-xs text-slate-400 mb-4">用量・投与方法・禁忌・薬価</p>
      <div className="space-y-3">
        {medications.map((med) => (
          <button
            key={med.id}
            onClick={() => setActive(med.id)}
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-violet-600">
                  <path fillRule="evenodd" d="M10.5 3.798v5.02a3 3 0 01-.879 2.121l-2.377 2.377a9.845 9.845 0 015.091 1.013 8.315 8.315 0 005.713.636l.285-.071-3.954-3.955a3 3 0 01-.879-2.121v-5.02a23.614 23.614 0 00-3 0zm4.5.138a.75.75 0 00.093-1.495A24.837 24.837 0 0012 2.25a25.048 25.048 0 00-3.093.191A.75.75 0 009 3.936v4.882a1.5 1.5 0 01-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.471-4.881L15.44 9.879A1.5 1.5 0 0115 8.818V3.936z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">{med.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{med.category}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
