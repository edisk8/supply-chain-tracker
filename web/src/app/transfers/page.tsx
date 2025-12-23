"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Web3Service, TransferData } from "@/lib/web3";
import TransferList from "@/components/TransferList";
import TraceabilityModal from "@/components/TraceabilityModal";
import { Search } from "lucide-react";

export default function TransfersPage() {
  const { signer, account } = useWallet();
  const [incoming, setIncoming] = useState<TransferData[]>([]);
  const [outgoing, setOutgoing] = useState<TransferData[]>([]);
  const [loading, setLoading] = useState(true);

  // States for the Traceability Modal
  const [selectedToken, setSelectedToken] = useState<{id: number, name: string} | null>(null);
  const [history, setHistory] = useState<TransferData[]>([]);
  const [isTracing, setIsTracing] = useState(false);

  const loadTransfers = async () => {
    if (!signer || !account) return;
    setLoading(true);
    const service = new Web3Service(signer);
    try {
      const ids = await service.getUserTransfers(account);
      const allTransfers = await Promise.all(ids.map(async (id) => {
        const t = await service.getTransfer(id);
        const token = await service.getToken(t.tokenId);
        return { ...t, tokenName: token.name };
      }));
      setIncoming(allTransfers.filter(t => t.to.toLowerCase() === account.toLowerCase()));
      setOutgoing(allTransfers.filter(t => t.from.toLowerCase() === account.toLowerCase()));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleTrace = async (tokenId: number, tokenName: string) => {
    if (!signer) return;
    setIsTracing(true);
    setSelectedToken({ id: tokenId, name: tokenName });
    try {
      const service = new Web3Service(signer);
      const tokenHistory = await service.getTokenHistory(tokenId);
      setHistory(tokenHistory);
    } catch (e) { console.error(e); } finally { setIsTracing(false); }
  };

  useEffect(() => { loadTransfers(); }, [signer, account]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-black text-slate-900 uppercase">Ledger Terminal</h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Transfer Records & Traceability</p>
      </div>

      <section>
        <h2 className="text-sm font-black text-blue-700 uppercase mb-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          Incoming Operations
        </h2>
        {/* Pass handleTrace to TransferList */}
        <TransferList transfers={incoming} isIncoming={true} onUpdate={loadTransfers} onTrace={handleTrace} />
      </section>

      <section>
        <h2 className="text-sm font-black text-slate-500 uppercase mb-4">Outbound History</h2>
        {/* Pass handleTrace to TransferList */}
        <TransferList transfers={outgoing} isIncoming={false} onUpdate={loadTransfers} onTrace={handleTrace} />
      </section>

      {/* Logic to display modal */}
      {selectedToken && (
        <TraceabilityModal 
          tokenId={selectedToken.id} 
          tokenName={selectedToken.name} 
          history={history} 
          onClose={() => setSelectedToken(null)} 
        />
      )}

      {/* Loading overlay for the Trace action */}
      {isTracing && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Scanning Chain for Provenance...</p>
          </div>
        </div>
      )}
    </div>
  );
}