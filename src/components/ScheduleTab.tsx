"use client";

import { useMemo } from "react";

export interface Offer {
  id: string;
  date: string;
  hospital: string;
  shift: string;
  pay: number;
}

interface ScheduleTabProps {
  availableDates: string[];
  pendingOffers: Offer[];
  acceptedOffers: Offer[];
  onToggleAvailable: (date: string) => void;
  onAcceptOffer: (id: string) => void;
  onDeclineOffer: (id: string) => void;
}

const BRAND = "#3D3D9E";

function fmtDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDateShort(date: string) {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export default function ScheduleTab({
  availableDates,
  pendingOffers,
  acceptedOffers,
  onToggleAvailable,
  onAcceptOffer,
  onDeclineOffer,
}: ScheduleTabProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = fmtDate(year, month, today.getDate());

  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);
  const offerDateSet = useMemo(
    () => new Set(pendingOffers.map((o) => o.date)),
    [pendingOffers]
  );
  const acceptedDateSet = useMemo(
    () => new Set(acceptedOffers.map((o) => o.date)),
    [acceptedOffers]
  );

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: fmtDate(year, month, d), day: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const availableThisMonth = [
    ...new Set([...availableDates, ...acceptedOffers.map((o) => o.date)]),
  ].filter((d) => d.startsWith(monthPrefix)).length;
  const pendingCount = pendingOffers.length;
  const expectedIncome = acceptedOffers
    .filter((o) => o.date.startsWith(monthPrefix))
    .reduce((s, o) => s + o.pay, 0);

  const monthLabel = `${year}年${month + 1}月`;
  const visibleOffers = pendingOffers.slice(0, 2);

  return (
    <div className="h-full overflow-hidden flex flex-col p-2.5 gap-2 bg-slate-50">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-1.5 flex-shrink-0">
        <SummaryCard label="空き日数" value={availableThisMonth} unit="日" />
        <SummaryCard label="オファー待ち" value={pendingCount} unit="件" />
        <SummaryCard
          label="今月見込み収入"
          value={expectedIncome.toLocaleString()}
          unit="円"
          compact
        />
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-1 px-0.5">
          <span className="text-xs font-bold" style={{ color: BRAND }}>
            {monthLabel}
          </span>
          <span className="text-[9px] text-slate-400">
            日付タップで空き日登録
          </span>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
            <div
              key={d}
              className={`text-center text-[9px] font-medium ${
                i === 0
                  ? "text-red-400"
                  : i === 6
                  ? "text-blue-400"
                  : "text-slate-400"
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} className="h-7" />;
            const isToday = cell.date === todayStr;
            const hasOffer = offerDateSet.has(cell.date);
            const isAccepted = acceptedDateSet.has(cell.date);
            const isAvailable = availableSet.has(cell.date) || isAccepted;

            let bg = "";
            let border = "border border-transparent";
            let text = "text-slate-700";
            const style: React.CSSProperties = {};

            if (isToday) {
              text = "text-white font-bold";
              style.backgroundColor = BRAND;
              border = "border border-transparent";
            } else if (hasOffer) {
              bg = "bg-yellow-100";
              text = "text-yellow-800 font-bold";
              border = "border-2";
              style.borderColor = "#F97316";
            } else if (isAvailable) {
              bg = "bg-green-100";
              text = "text-green-700 font-semibold";
              border = "border border-green-300";
            } else {
              bg = "hover:bg-slate-100";
            }

            return (
              <button
                key={i}
                onClick={() => onToggleAvailable(cell.date)}
                disabled={hasOffer || isAccepted}
                className={`h-7 flex items-center justify-center text-[10px] rounded transition-colors ${bg} ${border} ${text} ${
                  hasOffer || isAccepted ? "cursor-default" : "cursor-pointer"
                }`}
                style={style}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Offers */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-1 px-0.5 flex-shrink-0">
          <span className="text-xs font-bold text-slate-700">オファー一覧</span>
          {pendingOffers.length > 2 && (
            <span className="text-[9px] text-slate-400">
              他 {pendingOffers.length - 2} 件
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          {visibleOffers.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-3 bg-white rounded-xl border border-slate-200">
              現在オファーはありません
            </div>
          ) : (
            visibleOffers.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-xl border border-slate-200 px-2 py-1.5 flex items-center gap-1.5"
              >
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0"
                  style={{ backgroundColor: BRAND }}
                >
                  {formatDateShort(o.date)}
                </span>
                <span className="text-xs font-bold text-slate-800 truncate min-w-0 flex-1">
                  {o.hospital}
                </span>
                <span className="text-xs font-bold text-slate-700 flex-shrink-0 whitespace-nowrap">
                  ¥{o.pay.toLocaleString()}
                </span>
                <button
                  onClick={() => onAcceptOffer(o.id)}
                  className="flex-shrink-0 px-2.5 py-1 text-[11px] font-bold text-white rounded-md transition-opacity hover:opacity-90"
                  style={{ backgroundColor: BRAND }}
                >
                  承諾
                </button>
                <button
                  onClick={() => onDeclineOffer(o.id)}
                  className="flex-shrink-0 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
                >
                  断る
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  compact,
}: {
  label: string;
  value: number | string;
  unit: string;
  compact?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-2 py-1.5 text-center">
      <p className="text-[9px] text-slate-400 mb-0.5 whitespace-nowrap">
        {label}
      </p>
      <div className="flex items-baseline justify-center gap-0.5">
        <span
          className={`font-bold ${compact ? "text-sm" : "text-base"} leading-none`}
          style={{ color: BRAND }}
        >
          {value}
        </span>
        <span className="text-[9px] text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
