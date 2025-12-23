"use client";

import { useState } from "react";
import { TransferData, Web3Service } from "@/lib/web3";
import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
// 1. Added 'Search' to the imports
import { Check, X, Clock, Package, Search } from "lucide-react";

interface TransferListProps {
  transfers: TransferData[];
  isIncoming: boolean;
  onUpdate: () => void;
  // 2. Added 'onTrace' to the interface
  onTrace: (tokenId: number, tokenName: string) => void;
}

export default function TransferList({ transfers, isIncoming, onUpdate, onTrace }: TransferListProps) {
  const { signer } = useWallet();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleAction = async (transferId: number, action: "accept" | "reject") => {
    if (!signer) return;
    setLoadingId(transferId);
    
    try {
      const service = new Web3Service(signer);
      if (action === "accept") {
        await service.acceptTransfer(transferId);
      } else {
        await service.rejectTransfer(transferId);
      }
      onUpdate(); 
    } catch (error) {
      console.error(error);
      alert("Error processing transfer");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 0: return <span className="flex items-center text-yellow-600 text-[11px] font-bold uppercase tracking-tight"><Clock className="w-3.5 h-3.5 mr-1"/> Pending</span>;
      case 1: return <span className="flex items-center text-emerald-600 text-[11px] font-bold uppercase tracking-tight"><Check className="w-3.5 h-3.5 mr-1"/> Accepted</span>;
      case 2: return <span className="flex items-center text-rose-600 text-[11px] font-bold uppercase tracking-tight"><X className="w-3.5 h-3.5 mr-1"/> Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {transfers.length === 0 && (
        <p className="text-slate-500 text-sm italic py-4">No transfers found in this category.</p>
      )}
      
      {transfers.map((t) => (
        <Card key={t.id} className={`border-l-4 ${isIncoming ? 'border-l-blue-500' : 'border-l-slate-400'} hover:shadow-sm transition-all`}>
          <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-900" />
                <p className="text-sm font-bold text-slate-900">
                  {t.tokenName ? t.tokenName : `Token #${t.tokenId}`}
                </p>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  TRX #{t.id}
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-slate-700">
                  Qty: <span className="font-mono">{t.amount}</span>
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="font-bold uppercase tracking-tighter">{isIncoming ? "From:" : "To:"}</span>
                  <span className="font-mono bg-slate-50 px-1.5 rounded border border-slate-100 truncate max-w-[150px]">
                    {isIncoming ? t.from : t.to}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              {getStatusBadge(t.status)}
              
              <div className="flex gap-2 items-center">
                {/* 3. The Trace Button - Now calling the prop correctly */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-[10px] font-bold text-blue-600 border-blue-100 hover:bg-blue-50 gap-1 px-3"
                  onClick={() => onTrace(t.tokenId, t.tokenName || "Unknown Asset")}
                >
                  <Search className="w-3.5 h-3.5" /> TRACE
                </Button>

                {/* Accept/Reject logic for incoming pending items */}
                {isIncoming && t.status === 0 && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-slate-900 hover:bg-blue-600 text-white h-8 text-[10px] font-bold"
                      disabled={loadingId === t.id}
                      onClick={() => handleAction(t.id, "accept")}
                    >
                      ACCEPT
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50 h-8 text-[10px] font-bold"
                      disabled={loadingId === t.id}
                      onClick={() => handleAction(t.id, "reject")}
                    >
                      REJECT
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}