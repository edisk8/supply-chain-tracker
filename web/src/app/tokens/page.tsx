"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Web3Service, TokenData } from "@/lib/web3";
import TokenCard from "@/components/TokenCard";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react"; // Added for the icon requirement

export default function TokensPage() {
  // 1. Destructure 'role' from useWallet
  const { signer, account, role } = useWallet();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadTokens = async () => {
      if (!signer || !account) return;
      const service = new Web3Service(signer);
      const ids = await service.getUserTokens(account);
      const data = await Promise.all(ids.map(id => service.getToken(id)));
      
      const dataWithBalances = await Promise.all(data.map(async (t) => {
        const bal = await service.getTokenBalance(t.id, account);
        return { ...t, balance: bal };
      }));
      
      setTokens(dataWithBalances);
    };
    loadTokens();
  }, [signer, account]);

  // 2. Logic to determine if transfers are allowed for this user
  const isTransferAllowed = role !== "Consumer" && role !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-slate-900" />
        <h2 className="text-2xl font-bold text-slate-900">My Inventory</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((t: any) => (
          <TokenCard 
            key={t.id} 
            token={t} 
            userBalance={t.balance}
            // 3. Pass the permission flag to the child component
            showTransferButton={isTransferAllowed}
            onTransferClick={() => router.push(`/tokens/${t.id}/transfer`)}
          />
        ))}
      </div>
      
      {tokens.length === 0 && (
        <p className="text-center py-10 text-slate-500 italic">No assets found in your inventory.</p>
      )}
    </div>
  );
}