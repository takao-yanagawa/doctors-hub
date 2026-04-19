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
  },
  {
    id: "o2",
    date: "2026-04-22",
    hospital: "××病院",
    shift: "日直（9:00-17:00）",
    pay: 55000,
  },
  {
    id: "o3",
    date: "2026-04-26",
    hospital: "△△クリニック",
    shift: "外来（9:00-17:00）",
    pay: 60000,
  },
  {
    id: "o4",
    date: "2026-04-29",
    hospital: "□□病院",
    shift: "当直（17:00-翌9:00）",
    pay: 90000,
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
    setPendingOffers((prev) => {
      const offer = prev.find((o) => o.id === id);
      if (offer) {
        setAcceptedOffers((a) => [...a, offer]);
      }
      return prev.filter((o) => o.id !== id);
    });
  };

  const handleDeclineOffer = (id: string) => {
    setPendingOffers((prev) => {
      const offer = prev.find((o) => o.id === id);
      if (offer) {
        setDeclinedOffers((d) => [...d, offer]);
      }
      return prev.filter((o) => o.id !== id);
    });
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
