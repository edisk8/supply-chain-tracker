"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Box, Truck, UserCircle } from "lucide-react";

export default function Dashboard() {
  const { role, status, isAdmin } = useWallet();
  const router = useRouter();

  // 🛡️ Guard: Redirect Admin AWAY from this page to /admin
  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, router]);

  // If it's admin, return null while redirecting to prevent flash
  if (isAdmin) return null;

  // Logic for Pending/Rejected regular users
  if (status === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold text-yellow-600">Account Pending Approval</h2>
        <p className="text-slate-500">Please wait for an administrator to review your request.</p>
      </div>
    );
  }
  
  if (status === 2) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold text-red-600">Account Rejected</h2>
        <p className="text-slate-500">Your registration request was rejected by the administrator.</p>
      </div>
    );
  }

  const canCreate = role === "Producer" || role === "Factory";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Welcome, {role}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Tokens */}
        <Card className="hover:shadow-md transition cursor-pointer border-l-4 border-l-emerald-500">
          <CardHeader><CardTitle className="flex items-center gap-2"><Box className="text-emerald-600"/> My Tokens</CardTitle></CardHeader>
          <CardContent className="space-y-2">
             <Link href="/tokens"><Button variant="outline" className="w-full">View Inventory</Button></Link>
             {canCreate && <Link href="/tokens/create"><Button className="w-full">Create Token</Button></Link>}
          </CardContent>
        </Card>

        {/* Transfers */}
        <Card className="hover:shadow-md transition border-l-4 border-l-purple-500">
          <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="text-purple-600"/> Transfers</CardTitle></CardHeader>
          <CardContent>
             <Link href="/transfers"><Button variant="outline" className="w-full">Manage Transfers</Button></Link>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card className="hover:shadow-md transition border-l-4 border-l-slate-500">
          <CardHeader><CardTitle className="flex items-center gap-2"><UserCircle className="text-slate-600"/> Profile</CardTitle></CardHeader>
          <CardContent>
             <Link href="/profile"><Button variant="outline" className="w-full">My Profile</Button></Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}