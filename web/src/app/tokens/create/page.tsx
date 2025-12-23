"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Web3Service, TokenData } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Loader2, Link as LinkIcon, AlertCircle } from "lucide-react";

export default function CreateTokenPage() {
  const { signer, account } = useWallet();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", supply: 0, desc: "", parentId: 0 });
  
  // States for user's token inventory
  const [myTokens, setMyTokens] = useState<TokenData[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  // 1. Fetch tokens belonging ONLY to the current account
  useEffect(() => {
    const fetchMyTokens = async () => {
      if (!signer || !account) return;
      
      setLoadingTokens(true);
      try {
        const service = new Web3Service(signer);
        
        // Use the specific method to get IDs owned by the current account
        const myTokenIds = await service.getUserTokens(account);
        
        // Fetch details for each ID in parallel
        const tokenDetails = await Promise.all(
          myTokenIds.map(async (id) => {
            return await service.getToken(Number(id));
          })
        );

        setMyTokens(tokenDetails);
      } catch (error) {
        console.error("Failed to load your tokens:", error);
      } finally {
        setLoadingTokens(false);
      }
    };

    fetchMyTokens();
  }, [signer, account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) return;
    try {
      const service = new Web3Service(signer);
      await service.createToken(
        form.name, 
        form.supply, 
        { description: form.desc }, 
        form.parentId
      );
      router.push("/tokens");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <LinkIcon className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Create Token</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Token Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Product Name</label>
          <Input 
            placeholder="e.g. Refined Aluminum" 
            className="rounded-xl border-slate-200"
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
          />
        </div>

        {/* Total Supply */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Quantity to Mint</label>
          <Input 
            type="number" 
            placeholder="Units" 
            className="rounded-xl border-slate-200"
            onChange={e => setForm({...form, supply: Number(e.target.value)})} 
            required 
          />
        </div>

        {/* Features/Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Batch Details</label>
          <Input 
            placeholder="Technical specifications..." 
            className="rounded-xl border-slate-200"
            onChange={e => setForm({...form, desc: e.target.value})} 
          />
        </div>

        {/* DYNAMIC DROPDOWN: Restricted to User's Role/Inventory */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Parent Component (From your Inventory)</label>
          {loadingTokens ? (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span className="text-xs text-slate-400">Scanning inventory...</span>
            </div>
          ) : myTokens.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] text-amber-700 font-bold uppercase">No parent items found in your role</span>
            </div>
          ) : (
            <select 
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.parentId}
              onChange={e => setForm({...form, parentId: Number(e.target.value)})}
            >
              <option value={0}>Standard (No Parent / Raw Material)</option>
              {myTokens.map((token) => (
                <option key={token.id} value={token.id}>
                  ID: {token.id} - {token.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <Button 
          className="w-full bg-slate-900 hover:bg-blue-600 py-7 rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-slate-200 transition-all active:scale-95" 
          type="submit"
        >
          Confirm Token
        </Button>
      </form>
    </div>
  );
}