"use client";

import { useMemo, useState } from "react";

export interface Offer {
  id: string;
  date: string;
  hospital: string;
  shift: string;
  pay: number;
  address: string;
  workTime: string;
  workContent: string;
  payType: "時給" | "日給";
  transport: "あり" | "なし" | "実費支給";
  lunch: "あり" | "なし";
  items: string[];
  notes: string;
}

interface ScheduleTabProps {
  availableDates: string[];
  pendingOffers: Offer[];
  acceptedOffers: Offer[];
  declinedOffers: Offer[];
  onToggleAvailable: (date: string) => void;
  onAcceptOffer: (offer: Offer) => void;
  onDeclineOffer: (offer: Offer) => void;
}

const BRAND = "#3D3D9E";
const ACCEPTED = "#5B5BAE";

function fmtDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDateShort(date: string) {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ScheduleTab({
  availableDates,
  pendingOffers,
  acceptedOffers,
  declinedOffers,
  onToggleAvailable,
  onAcceptOffer,
  onDeclineOffer,
}: ScheduleTabProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [detailView, setDetailView] = useState<{
    offer: Offer;
    readonly: boolean;
  } | null>(null);

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

  const detailModal = detailView && (
    <OfferDetailModal
      offer={detailView.offer}
      readonly={detailView.readonly}
      onAccept={() => {
        onAcceptOffer(detailView.offer);
        setDetailView(null);
      }}
      onDecline={() => {
        onDeclineOffer(detailView.offer);
        setDetailView(null);
      }}
      onClose={() => setDetailView(null)}
    />
  );

  if (showHistory) {
    return (
      <>
        <HistoryView
          acceptedOffers={acceptedOffers}
          declinedOffers={declinedOffers}
          onClose={() => setShowHistory(false)}
          onOpenDetail={(o) => setDetailView({ offer: o, readonly: true })}
        />
        {detailModal}
      </>
    );
  }

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
            const isAvailable = availableSet.has(cell.date);

            let bg = "";
            let border = "border border-transparent";
            let text = "text-slate-700";
            const style: React.CSSProperties = {};

            if (isToday) {
              text = "text-white font-bold";
              style.backgroundColor = BRAND;
              border = hasOffer
                ? "border-2"
                : "border border-transparent";
              if (hasOffer) style.borderColor = "#F97316";
            } else if (isAccepted) {
              text = "text-white font-bold";
              style.backgroundColor = ACCEPTED;
              border = hasOffer
                ? "border-2"
                : "border border-transparent";
              if (hasOffer) style.borderColor = "#F97316";
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

            const locked = hasOffer || isAccepted;

            return (
              <button
                key={i}
                onClick={() => onToggleAvailable(cell.date)}
                disabled={locked}
                className={`relative h-7 flex items-center justify-center text-[10px] rounded transition-colors ${bg} ${border} ${text} ${
                  locked ? "cursor-default" : "cursor-pointer"
                }`}
                style={style}
              >
                {cell.day}
                {isAccepted && (
                  <CheckIcon className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-white" />
                )}
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
                className="bg-white rounded-xl border border-slate-200 px-2 py-1.5 flex items-center gap-1"
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
                  onClick={() => setDetailView({ offer: o, readonly: false })}
                  className="flex-shrink-0 px-1.5 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
                  aria-label="詳細を見る"
                >
                  詳細
                </button>
                <button
                  onClick={() => onAcceptOffer(o)}
                  className="flex-shrink-0 px-2 py-1 text-[11px] font-bold text-white rounded-md transition-opacity hover:opacity-90"
                  style={{ backgroundColor: BRAND }}
                >
                  承諾
                </button>
                <button
                  onClick={() => onDeclineOffer(o)}
                  className="flex-shrink-0 px-1.5 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
                >
                  断る
                </button>
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="mt-2 self-center text-[11px] font-medium text-slate-500 hover:text-slate-700 underline"
        >
          履歴を見る（承諾 {acceptedOffers.length} ／ 断った {declinedOffers.length}）
        </button>
      </div>

      {detailModal}
    </div>
  );
}

function OfferDetailModal({
  offer,
  readonly,
  onAccept,
  onDecline,
  onClose,
}: {
  offer: Offer;
  readonly?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-3 border-b border-slate-100 flex-shrink-0">
          <div className="min-w-0">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
              style={{ backgroundColor: BRAND }}
            >
              {formatDateShort(offer.date)}
            </span>
            <h3 className="text-sm font-bold text-slate-800 mt-1 truncate">
              {offer.hospital}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-3 py-2">
          <DetailRow label="住所" value={offer.address} />
          <DetailRow label="勤務時間" value={offer.workTime} />
          <DetailRow label="勤務内容" value={offer.workContent} />
          <DetailRow
            label="報酬"
            value={`¥${offer.pay.toLocaleString()}（${offer.payType}）`}
          />
          <DetailRow label="交通費" value={offer.transport} />
          <DetailRow label="昼食" value={offer.lunch} />
          <DetailRow
            label="持参物"
            value={offer.items.length > 0 ? offer.items.join("、") : "なし"}
          />
          <DetailRow label="備考" value={offer.notes} />
        </div>
        <div className="p-2.5 border-t border-slate-100 flex gap-1.5 flex-shrink-0">
          {!readonly && (
            <>
              <button
                onClick={onAccept}
                className="flex-1 py-2 text-xs font-bold text-white rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                承諾する
              </button>
              <button
                onClick={onDecline}
                className="flex-1 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                断る
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className={`${
              readonly ? "w-full" : "flex-1"
            } py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200`}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-[11px] text-slate-500 w-16 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-xs text-slate-800 font-medium flex-1 break-words leading-relaxed">
        {value}
      </span>
    </div>
  );
}

function HistoryView({
  acceptedOffers,
  declinedOffers,
  onClose,
  onOpenDetail,
}: {
  acceptedOffers: Offer[];
  declinedOffers: Offer[];
  onClose: () => void;
  onOpenDetail: (offer: Offer) => void;
}) {
  return (
    <div className="h-full overflow-hidden flex flex-col p-2.5 bg-slate-50">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <span className="text-sm font-bold" style={{ color: BRAND }}>
          オファー履歴
        </span>
        <button
          onClick={onClose}
          className="text-xs font-medium text-slate-600 px-3 py-1 border border-slate-300 bg-white rounded-md hover:bg-slate-50"
        >
          閉じる
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">
        <section>
          <h3 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            承諾済み（{acceptedOffers.length}件）
          </h3>
          {acceptedOffers.length === 0 ? (
            <p className="text-[11px] text-slate-400 px-2 py-3 bg-white rounded-lg border border-slate-200 text-center">
              承諾済みのオファーはありません
            </p>
          ) : (
            <div className="space-y-1.5">
              {acceptedOffers.map((o) => (
                <div
                  key={o.id}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 flex items-center gap-1.5"
                >
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 flex-shrink-0">
                    <CheckIcon className="w-2.5 h-2.5" />
                    承諾
                  </span>
                  <span className="text-[11px] text-slate-500 flex-shrink-0">
                    {formatDateShort(o.date)}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate min-w-0 flex-1">
                    {o.hospital}
                  </span>
                  <span className="text-xs font-bold text-slate-700 flex-shrink-0 whitespace-nowrap">
                    ¥{o.pay.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onOpenDetail(o)}
                    className="flex-shrink-0 px-1.5 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
                    aria-label="詳細を見る"
                  >
                    詳細
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
            断った（{declinedOffers.length}件）
          </h3>
          {declinedOffers.length === 0 ? (
            <p className="text-[11px] text-slate-400 px-2 py-3 bg-white rounded-lg border border-slate-200 text-center">
              断ったオファーはありません
            </p>
          ) : (
            <div className="space-y-1.5">
              {declinedOffers.map((o) => (
                <div
                  key={o.id}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 flex items-center gap-1.5"
                >
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 flex-shrink-0">
                    断った
                  </span>
                  <span className="text-[11px] text-slate-500 flex-shrink-0">
                    {formatDateShort(o.date)}
                  </span>
                  <span className="text-xs font-medium text-slate-700 truncate min-w-0 flex-1">
                    {o.hospital}
                  </span>
                  <button
                    onClick={() => onOpenDetail(o)}
                    className="flex-shrink-0 px-1.5 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
                    aria-label="詳細を見る"
                  >
                    詳細
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
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
