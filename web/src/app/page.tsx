"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { Web3Service, UserData } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  ShieldCheck, 
  Factory, 
  Store, 
  User, 
  Loader2,
  Clock,
  UserPlus,
  ChevronsRight, // Added for the flow arrows
  Box
} from "lucide-react";

export default function LandingPage() {
  const { isConnected, connect, account, signer, isAdmin, refreshUser } = useWallet();
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Producer");

  // 1. HIGH-PRIORITY REDIRECT: Admin
  useEffect(() => {
    if (isConnected && isAdmin) {
      router.push("/admin");
    }
  }, [isConnected, isAdmin, router]);

  const loadUserData = async () => {
    if (!signer || !account || isAdmin) return;

    setLoading(true);
    try {
      const service = new Web3Service(signer);
      const data = await service.getUserInfo(account);
      setUserInfo(data);
      
      if (data.status === 1) {
        router.push("/dashboard");
      }
    } catch (e) {
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!signer) return;
    setRequesting(true);
    try {
      const service = new Web3Service(signer);
      await service.requestUserRole(selectedRole);
      
      if (refreshUser) await refreshUser();
      await loadUserData();
    } catch (error: any) {
      console.error("Registration error:", error);
      alert(error.message || "Error signing transaction.");
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    if (isConnected && !isAdmin) {
      loadUserData();
    }
  }, [isConnected, account, isAdmin]);

  if (loading || (isConnected && isAdmin)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          {isAdmin ? "Admin Gateway Active" : "Querying Blockchain..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-slate-50/50">
        
        {/* VIEW 1: DISCONNECTED */}
        {!isConnected && (
          <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in duration-700">
            <div className="space-y-6">
              <h4 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.8] uppercase">
                SUPPLY<span className="text-blue-600">CHAIN</span> TRACKER
              </h4>
              <p className="max-w-xl mx-auto text-slate-500 text-lg font-medium">
                DApp para gestionar trazabilidad en cadenas de suministro de productos y sus usuarios.
              </p>
            </div>

            {/* --- NEW FLOW SEQUENCE SECTION --- */}
            <div className="flex items-center justify-center gap-2 md:gap-4 py-8">
              {[
                { label: "Producer", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
                { label: "Factory", icon: Factory, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Retailer", icon: Store, color: "text-amber-500", bg: "bg-amber-50" },
                { label: "Consumer", icon: User, color: "text-slate-500", bg: "bg-slate-50" },
              ].map((step, index, arr) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`${step.bg} p-3 rounded-xl border border-slate-100 shadow-sm`}>
                      <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${step.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {step.label}
                    </span>
                  </div>
                  {index < arr.length - 1 && (
                    <ChevronsRight className="w-4 h-4 text-slate-300 mx-1 md:mx-2 mt-[-15px]" />
                  )}
                  {index < arr.length - 1 && (
                    <Box className="w-4 h-4 text-slate-300 mx-1 md:mx-2 mt-[-15px]" />
                  )}
                   {index < arr.length - 1 && (
                    <ChevronsRight className="w-4 h-4 text-slate-300 mx-1 md:mx-2 mt-[-15px]" />
                  )}
                </div>
              ))}
            </div>
            {/* ------------------------------- */}

            <div className="flex justify-center pt-4">
              <Button onClick={connect} size="lg" className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-8 rounded-2xl text-xl font-bold shadow-2xl transition-all">
                Connect Wallet to Start
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {/* VIEW 2: REGISTER FORM */}
        {isConnected && !isAdmin && (!userInfo || userInfo.id === 0) && (
          <div className="w-full flex justify-center animate-in zoom-in-95 duration-500">
            <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
              <div className="bg-slate-900 p-6 text-white">
                <div className="flex items-center gap-4 mb-2">
                  <UserPlus className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">JOIN THE NETWORK</h3>
                </div>
                <p className="text-xs text-slate-400">Select your role in Supply Chain Tracker network</p>
              </div>
              
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Producer', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { id: 'Factory', icon: Factory, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { id: 'Retailer', icon: Store, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { id: 'Consumer', icon: User, color: 'text-slate-600', bg: 'bg-slate-50' }
                  ].map((roleItem) => (
                    <button
                      key={roleItem.id}
                      onClick={() => setSelectedRole(roleItem.id)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                        selectedRole === roleItem.id 
                        ? `border-blue-600 ${roleItem.bg} scale-[1.02] shadow-inner` 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <roleItem.icon className={`w-7 h-7 ${roleItem.color}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{roleItem.id}</span>
                    </button>
                  ))}
                </div>

                <Button onClick={handleRegister} disabled={requesting} className="w-full bg-blue-600 hover:bg-slate-900 py-7 rounded-2xl font-black text-lg shadow-xl uppercase transition-all">
                  {requesting ? "Processing..." : "Send Request" }
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW 3: PENDING APPROVAL */}
        {isConnected && !isAdmin && userInfo && userInfo.id !== 0 && userInfo.status !== 1 && (
          <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative mx-auto w-20 h-20">
               <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping" />
               <div className="relative w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                  <Clock className="w-10 h-10 text-amber-600" />
               </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Identity Pending</h3>
              <p className="text-sm text-slate-500">
                Your request for <span className="font-bold text-slate-900">[{userInfo.role}]</span> access is being reviewed.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}