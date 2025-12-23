"use client";
import { useWallet } from "@/hooks/useWallet";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function AdminDashboard() {
  const { isAdmin } = useWallet();

  if (!isAdmin) return <div className="text-red-500 font-bold text-center mt-10">Access Denied</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Administration</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4 mb-4">
            <Users className="w-8 h-8 text-blue-600"/>
            <h3 className="text-xl font-semibold">User Management</h3>
          </div>
          <p className="text-slate-500 mb-4">Approve, reject or cancel user registrations.</p>
          <Link href="/admin/users"><Button className="w-full">Manage Users</Button></Link>
        </div>
      </div>
    </div>
  );
}