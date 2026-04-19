"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import ChatTab from "@/components/ChatTab";
import CalculatorTab from "@/components/CalculatorTab";
import GuidelinesTab from "@/components/GuidelinesTab";
import MedicationsTab from "@/components/MedicationsTab";
import ScheduleTab, { type Offer } from "@/components/ScheduleTab";
import SettingsTab from "@/components/SettingsTab";
import LoginScreen from "@/components/LoginScreen";

const INITIAL_PENDING_OFFERS: Offer[] = [
  {
    id: "o1",
    date: "2026-04-22",
    hospital: "○○総合病院",
    shift: "当直（17:00-翌8:00）",
    pay: 80000,
    address: "東京都新宿区西新宿2-1-1",
    workTime: "17:00〜翌8:00",
    workContent: "救急当直（二次救急対応）",
    payType: "日給",
    transport: "実費支給",
    lunch: "あり",
    items: ["白衣", "聴診器", "院内シューズ"],
    notes: "当直室あり。仮眠可。救急搬入は平均3〜5件/夜。",
  },
  {
    id: "o2",
    date: "2026-04-22",
    hospital: "××病院",
    shift: "日直（9:00-17:00）",
    pay: 55000,
    address: "東京都世田谷区三軒茶屋1-2-3",
    workTime: "9:00〜17:00",
    workContent: "内科外来（一般内科）",
    payType: "日給",
    transport: "あり",
    lunch: "あり",
    items: ["白衣", "聴診器"],
    notes: "電子カルテはDynamics使用。初診患者は少なめ。",
  },
  {
    id: "o3",
    date: "2026-04-26",
    hospital: "△△クリニック",
    shift: "外来（9:00-17:00）",
    pay: 60000,
    address: "東京都品川区大崎3-4-5",
    workTime: "9:00〜17:00（休憩12:00〜13:00）",
    workContent: "内科外来・健診",
    payType: "日給",
    transport: "実費支給",
    lunch: "なし",
    items: ["白衣", "聴診器", "印鑑"],
    notes: "健診メイン。午後は外来。",
  },
  {
    id: "o4",
    date: "2026-04-29",
    hospital: "□□病院",
    shift: "当直（17:00-翌9:00）",
    pay: 90000,
    address: "神奈川県横浜市中区山下町10-1",
    workTime: "17:00〜翌9:00",
    workContent: "一次救急当直",
    payType: "日給",
    transport: "実費支給",
    lunch: "あり",
    items: ["白衣", "聴診器"],
    notes: "当直室あり。夜間は看護師2名体制。",
  },
];

const INITIAL_AVAILABLE_DATES = [
  "2026-04-22",
  "2026-04-23",
  "2026-04-25",
  "2026-04-28",
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const [availableDates, setAvailableDates] = useState<string[]>(
    INITIAL_AVAILABLE_DATES
  );
  const [pendingOffers, setPendingOffers] = useState<Offer[]>(
    INITIAL_PENDING_OFFERS
  );
  const [acceptedOffers, setAcceptedOffers] = useState<Offer[]>([]);
  const [declinedOffers, setDeclinedOffers] = useState<Offer[]>([]);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthenticated(false);
  };

  const handleToggleAvailable = (date: string) => {
    setAvailableDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleAcceptOffer = (id: string) => {
    const offer = pendingOffers.find((o) => o.id === id);
    if (!offer) return;
    setPendingOffers((prev) => prev.filter((o) => o.id !== id));
    setAcceptedOffers((prev) =>
      prev.some((o) => o.id === id) ? prev : [...prev, offer]
    );
  };

  const handleDeclineOffer = (id: string) => {
    const offer = pendingOffers.find((o) => o.id === id);
    if (!offer) return;
    setPendingOffers((prev) => prev.filter((o) => o.id !== id));
    setDeclinedOffers((prev) =>
      prev.some((o) => o.id === id) ? prev : [...prev, offer]
    );
    // availableDates is intentionally not touched: if the offer's date was
    // a user-marked available day, it must stay green after the decline.
  };

  // Loading state
  if (authenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-3 border-blue-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login screen
  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white">
      {/* Header */}
      <header className="flex-shrink-0 bg-blue-800 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
          DH
        </div>
        <div>
          <h1 className="text-base font-bold tracking-wide">DOCTORS HUB</h1>
          <p className="text-[10px] text-blue-200 -mt-0.5">Clinical AI Assistant</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 0 && <ChatTab />}
        {activeTab === 1 && <CalculatorTab />}
        {activeTab === 2 && <GuidelinesTab />}
        {activeTab === 3 && <MedicationsTab />}
        {activeTab === 4 && (
          <ScheduleTab
            availableDates={availableDates}
            pendingOffers={pendingOffers}
            acceptedOffers={acceptedOffers}
            declinedOffers={declinedOffers}
            onToggleAvailable={handleToggleAvailable}
            onAcceptOffer={handleAcceptOffer}
            onDeclineOffer={handleDeclineOffer}
          />
        )}
        {activeTab === 5 && <SettingsTab onLogout={handleLogout} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scheduleBadge={pendingOffers.length}
      />
    </div>
  );
}
