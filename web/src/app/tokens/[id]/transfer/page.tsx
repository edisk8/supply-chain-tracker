"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { Web3Service } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Send, ArrowLeft, UserCheck, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function TransferPage() {
  const params = useParams();
  const id = params?.id;
  const { signer, account, role } = useWallet();
  const router = useRouter();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenName, setTokenName] = useState("Loading...");
  const [balance, setBalance] = useState(0);
  const [recipients, setRecipients] = useState<{address: string, role: string}[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // New State for Preview Modal
  const [showPreview, setShowPreview] = useState(false);

  const getNextAllowedRole = (currentRole: string | null) => {
    switch (currentRole) {
      case "Producer": return "Factory";
      case "Factory": return "Retailer";
      case "Retailer": return "Consumer";
      default: return null;
    }
  };
  const targetRole = getNextAllowedRole(role);

  useEffect(() => {
    const fetchData = async () => {
      if (!signer || !account || !id || !targetRole) return;
      try {
        const service = new Web3Service(signer);
        const [tokenData, bal, validUsers] = await Promise.all([
          service.getToken(Number(id)),
          service.getTokenBalance(Number(id), account),
          service.getValidRecipients(targetRole)
        ]);
        setTokenName(tokenData.name);
        setBalance(bal);
        setRecipients(validUsers);
      } catch (e) { console.error(e); } finally { setIsFetching(false); }
    };
    fetchData();
  }, [signer, account, id, targetRole]);

  // Handle Initial Validation before showing Preview
  const openPreview = () => {
    const numAmount = Number(amount);
    if (!to) return alert("Please select a recipient");
    if (numAmount <= 0) return alert("Amount must be greater than zero");
    
    // Clearer error message for balance issues
    if (numAmount > balance) {
      return alert(`❌ Insufficient Amount: You are trying to transfer ${numAmount} ${tokenName}, but you only have ${balance} available in your inventory.`);
    }
    
    setShowPreview(true);
  };

  const handleFinalTransfer = async () => {
    if (!signer || !id) return;
    try {
      const service = new Web3Service(signer);
      await service.transferToken(to, Number(id), Number(amount));
      router.push("/transfers");
    } catch (e: any) {
      alert(e.message || "Blockchain transaction failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <Link href="/tokens" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Inventory
      </Link>

      <Card className="shadow-lg border-slate-200 overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Send className="w-5 h-5 text-blue-600" /> Transfer {tokenName}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-5 pt-6">
          <div className="bg-slate-900 text-white p-4 rounded-lg flex justify-between items-center">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Inventory</span>
            <span className="font-mono text-xl font-bold">{balance}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Recipient ({targetRole})</label>
            <select 
              className="w-full p-2.5 bg-white border border-slate-300 rounded-md text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            >
              <option value="">-- Select Approved {targetRole} --</option>
              {recipients.map(r => (
                <option key={r.address} value={r.address}>{r.address}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Amount to Send</label>
            <div className="relative">
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-600"
                onClick={() => setAmount(balance.toString())}
              >MAX</button>
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11" onClick={openPreview} disabled={isFetching || !to}>
            Preview Transaction
          </Button>
        </CardContent>
      </Card>

      {/* --- TRANSACTION PREVIEW MODAL --- */}
      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm border-2 border-blue-500 shadow-2xl animate-in zoom-in-95">
            <CardHeader className="bg-blue-50 text-blue-900 border-b border-blue-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Confirm Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Asset:</span>
                  <span className="font-bold">{tokenName} (ID: {id})</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-bold text-blue-600">{amount} units</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500">Recipient Address:</span>
                  <p className="font-mono text-[11px] bg-slate-100 p-2 rounded break-all">{to}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowPreview(false)}>Edit</Button>
                <Button className="flex-1 bg-blue-600" onClick={handleFinalTransfer}>Send Now</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}