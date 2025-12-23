"use client";

import { useWallet } from "@/hooks/useWallet";
import { Button } from "./ui/button";
import { 
  Package, 
  LayoutDashboard, 
  ShieldCheck, 
  Factory, 
  Store, 
  User, 
  Settings,
  LogOut
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const { account, connect, disconnect, role, isConnected, isAdmin } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleDisconnect = () => {
    disconnect();
    router.push("/");
  };

  // Logic for Role Icons
  const getRoleIcon = () => {
    if (isAdmin) return <Settings className="w-3 h-3" />;
    const r = role?.toLowerCase();
    if (r?.includes("producer")) return <ShieldCheck className="w-3 h-3" />;
    if (r?.includes("factory")) return <Factory className="w-3 h-3" />;
    if (r?.includes("retailer")) return <Store className="w-3 h-3" />;
    if (r?.includes("consumer")) return <User className="w-3 h-3" />;
    return null;
  };

  return (
    <header className="relative border-b bg-white overflow-hidden">
      {/* Flowing Gradient Animation */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-100">
        <div 
          className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 w-1/3"
          style={{ animation: 'flow 3s linear infinite' }}
        />
      </div>

      <style jsx>{`
        @keyframes flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>

      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-10">
        
        {/* Left Section: Branding & Navigation */}
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => router.push("/")}
          >
            <div className="relative">
              <div className="p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-slate-200">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-slate-900 font-black tracking-tight text-lg leading-none uppercase">
                Supply<span className="text-blue-600 font-light"> Chain</span> TRACKER
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                Blockchain Ledger
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          {isConnected && (
            <nav className="hidden lg:flex items-center gap-1 border-l pl-6 ml-2 border-slate-100">
              {isAdmin ? (
                <Link 
                  href="/admin" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all ${
                    pathname === "/admin" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Settings className="w-4 h-4" /> ADMIN PANEL
                </Link>
              ) : (
                <Link 
                  href="/dashboard" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all ${
                    pathname === "/dashboard" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> DASHBOARD
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right Section: User / Wallet Area */}
        <div className="flex items-center gap-4">
          {isConnected && account ? (
            <div className="flex items-center gap-4">
              
              {/* Role Badge with Icon */}
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-tighter">Authorization</span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-black uppercase shadow-sm">
                  {getRoleIcon()}
                  {role || (isAdmin ? "Admin" : "User")}
                </span>
              </div>

              <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />
              
              {/* Network Identity */}
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-tighter">Network Identity</span>
                <span className="text-xs font-mono text-slate-900 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {formatAddress(account)}
                </span>
              </div>

              {/* Restored Disconnect Label */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDisconnect}
                className="ml-2 h-9 text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>DISCONNECT</span>
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connect}
              className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl px-6 h-10 font-bold text-xs tracking-wide shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              INITIALIZE CONNECTION
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}