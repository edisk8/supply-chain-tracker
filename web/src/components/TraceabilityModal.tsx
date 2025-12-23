"use client";
import { TransferData } from "@/lib/web3";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { 
  History, 
  Package, 
  Calendar, 
  ArrowDown, 
  User, 
  ShieldCheck, 
  Store, 
  Factory, 
  Truck 
} from "lucide-react";

interface TraceabilityModalProps {
  tokenName: string;
  tokenId: number;
  history: TransferData[];
  onClose: () => void;
}

export default function TraceabilityModal({ tokenName, tokenId, history, onClose }: TraceabilityModalProps) {
  
  // Helper to render specific icons based on the role name
  const getRoleIcon = (role: string | undefined) => {
    const r = role?.toLowerCase();
    if (r?.includes("producer")) return <ShieldCheck className="w-3 h-3" />;
    if (r?.includes("factory")) return <Factory className="w-3 h-3" />;
    if (r?.includes("retailer")) return <Store className="w-3 h-3" />;
    if (r?.includes("consumer")) return <User className="w-3 h-3" />;
    return <Truck className="w-3 h-3" />;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* HEADER SECTION */}
        <CardHeader className="bg-slate-900 text-white shrink-0 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <History className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight">{tokenName}</CardTitle>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold flex items-center gap-1">
                  <Package className="w-3 h-3" /> Provenance Ledger #{tokenId}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        {/* TIMELINE CONTENT */}
        <CardContent className="overflow-y-auto p-8 bg-slate-50/50">
          <div className="relative">
            {/* The Vertical Continuous Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-10">
              {history.length === 0 && (
                <div className="ml-12 p-8 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-center">
                  <p className="text-sm italic">No verified transfer history detected on the blockchain.</p>
                </div>
              )}

              {history.map((step: any, index: number) => (
                <div key={step.id} className="relative flex items-start group">
                  
                  {/* Timeline Node Point */}
                  <div className="absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-md z-10 ring-4 ring-transparent group-hover:ring-blue-100 transition-all" />

                  <div className="ml-12 flex-1">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                      
                      {/* Node Header */}
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 flex items-center gap-1.5">
                          Node {index + 1}: Ownership Transfer
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">
                          TRX_{step.id}
                        </span>
                      </div>

                      {/* Sender and Recipient Roles & Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* FROM (Origin) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">From (Origin)</label>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold border border-slate-200 flex items-center gap-1">
                              {getRoleIcon(step.fromRole)} {step.fromRole || "Unknown"}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono bg-slate-50 p-2 rounded truncate border border-slate-100 text-slate-500 select-all">
                            {step.from}
                          </p>
                        </div>

                        {/* TO (Recipient) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">To (Recipient)</label>
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold shadow-sm flex items-center gap-1">
                              {getRoleIcon(step.toRole)} {step.toRole || "Unknown"}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono bg-blue-50/20 p-2 rounded truncate border border-blue-100 text-slate-700 font-medium select-all">
                            {step.to}
                          </p>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(step.dateCreated * 1000).toLocaleString()}
                        </div>
                        <div className="text-[11px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                          Qty: <span className="font-mono">{step.amount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow between steps */}
                    {index < history.length - 1 && (
                      <div className="flex justify-center my-3 text-slate-300">
                        <ArrowDown className="w-5 h-5 animate-bounce duration-[2000ms]" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        {/* AUDIT FOOTER */}
        <div className="p-4 bg-white border-t flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Blockchain Verified Records
          </div>
        </div>
      </Card>
    </div>
  );
}