"use client";

import { useState } from "react";

interface Guideline {
  category: string;
  items: {
    name: string;
    org: string;
    year: string;
    summary: string;
    url?: string;
  }[];
}

const guidelines: Guideline[] = [
  {
    category: "脳卒中",
    items: [
      {
        name: "脳卒中治療ガイドライン2021（改訂2023）",
        org: "日本脳卒中学会",
        year: "2023",
        summary:
          "急性期脳梗塞のrt-PA静注療法（発症4.5時間以内）、機械的血栓回収療法（発症24時間以内の選択症例）、抗血小板療法・抗凝固療法の推奨を網羅。",
      },
      {
        name: "くも膜下出血の診療ガイドライン",
        org: "日本脳卒中の外科学会",
        year: "2023",
        summary:
          "SAHの重症度分類（WFNS, Hunt&Hess）、早期手術適応、血管攣縮予防（ファスジル、オザグレル）、トリプルH療法について記載。",
      },
    ],
  },
  {
    category: "循環器",
    items: [
      {
        name: "急性冠症候群ガイドライン（2018年改訂版）",
        org: "日本循環器学会",
        year: "2018",
        summary:
          "STEMI/NSTEMIの診断基準、緊急PCI適応、DAPT期間、二次予防としてのスタチン・ACE阻害薬の推奨。",
      },
      {
        name: "不整脈薬物治療ガイドライン（2020年改訂版）",
        org: "日本循環器学会",
        year: "2020",
        summary:
          "心房細動の抗凝固療法（DOAC優先）、CHADS2/CHA2DS2-VAScスコアに基づく治療選択、レートコントロール vs リズムコントロール。",
      },
    ],
  },
  {
    category: "救急・集中治療",
    items: [
      {
        name: "日本版敗血症診療ガイドライン2020（J-SSCG2020）",
        org: "日本集中治療医学会・日本救急医学会",
        year: "2020",
        summary:
          "qSOFAによるスクリーニング、1時間バンドル（血液培養、抗菌薬、乳酸測定、輸液）、ノルエピネフリン第一選択。",
      },
      {
        name: "JRC蘇生ガイドライン2020",
        org: "日本蘇生協議会",
        year: "2020",
        summary:
          "BLS/ALSアルゴリズム、エピネフリン投与間隔、ROSC後の体温管理療法（32-36°C）、小児・新生児蘇生。",
      },
    ],
  },
  {
    category: "消化器",
    items: [
      {
        name: "消化性潰瘍診療ガイドライン2020",
        org: "日本消化器病学会",
        year: "2020",
        summary:
          "H. pylori除菌療法（一次：PPI+AMPC+CAM）、NSAIDs潰瘍予防（PPI併用）、出血性潰瘍の内視鏡的止血術。",
      },
    ],
  },
  {
    category: "感染症",
    items: [
      {
        name: "JAID/JSC感染症治療ガイドライン2019",
        org: "日本感染症学会・日本化学療法学会",
        year: "2019",
        summary:
          "臓器別の経験的抗菌薬選択、市中肺炎・尿路感染・皮膚軟部組織感染の推奨レジメン、de-escalationの原則。",
      },
    ],
  },
];

export default function GuidelinesTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="font-bold text-base text-slate-800 mb-1">診療ガイドライン</h2>
      <p className="text-xs text-slate-400 mb-4">主要な日本語ガイドラインの概要</p>

      <div className="space-y-3">
        {guidelines.map((group) => (
          <div key={group.category}>
            <button
              onClick={() =>
                setExpanded(expanded === group.category ? null : group.category)
              }
              className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm text-slate-800">{group.category}</h3>
                  <p className="text-[10px] text-slate-400">{group.items.length}件のガイドライン</p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expanded === group.category ? "rotate-180" : ""
                }`}
              >
                <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
              </svg>
            </button>

            {expanded === group.category && (
              <div className="mt-2 space-y-2 pl-2">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-100 rounded-xl p-3"
                  >
                    <h4 className="font-bold text-xs text-slate-800">{item.name}</h4>
                    <p className="text-[10px] text-blue-600 mt-0.5">
                      {item.org} ({item.year})
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-800">
          <span className="font-bold">注意：</span>
          ここに記載のガイドラインは概要です。臨床判断には必ず原文を参照してください。
          最新版は各学会の公式サイトでご確認ください。
        </p>
      </div>
    </div>
  );
}
