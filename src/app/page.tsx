"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import ChatTab from "@/components/ChatTab";
import CalculatorTab from "@/components/CalculatorTab";
import GuidelinesTab from "@/components/GuidelinesTab";
import MedicationsTab from "@/components/MedicationsTab";
import SettingsTab from "@/components/SettingsTab";
import LoginScreen from "@/components/LoginScreen";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

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
        {activeTab === 4 && <SettingsTab onLogout={handleLogout} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
