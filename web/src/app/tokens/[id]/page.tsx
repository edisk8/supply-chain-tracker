"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { Web3Service, TokenData } from "@/lib/web3";

export default function TokenDetailPage() {
  const params = useParams();
  const { signer } = useWallet();
  const [token, setToken] = useState<TokenData | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!signer || !params.id) return;
      const service = new Web3Service(signer);
      const data = await service.getToken(Number(params.id));
      setToken(data);
    };
    load();
  }, [signer, params.id]);

  if (!token) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">{token.name} (ID: {token.id})</h2>
      <div className="bg-white p-6 rounded shadow space-y-2">
        <p><strong>Creator:</strong> {token.creator}</p>
        <p><strong>Supply:</strong> {token.totalSupply}</p>
        <p><strong>Features:</strong> {token.features}</p>
        <p><strong>Parent Token ID:</strong> {token.parentId}</p>
        <p><strong>Date Created:</strong> {new Date(token.dateCreated * 1000).toLocaleString()}</p>
      </div>
    </div>
  );
}