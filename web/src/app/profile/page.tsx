"use client";
import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { account, role, status } = useWallet();

  const getStatusText = (s: number | null) => {
    if (s === 0) return "Pending";
    if (s === 1) return "Approved";
    if (s === 2) return "Rejected";
    if (s === 3) return "Canceled";
    return "Unknown";
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-500">Wallet Address</label>
            <p className="font-mono bg-slate-100 p-2 rounded break-all">{account}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-500">Role</label>
              <p className="text-lg font-bold">{role || "None"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Status</label>
              <p className={`text-lg font-bold ${status === 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                {getStatusText(status)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}