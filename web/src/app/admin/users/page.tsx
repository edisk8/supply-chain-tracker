"use client";
import { useWallet } from "@/hooks/useWallet";
import UserTable from "@/components/UserTable";

export default function AdminUsersPage() {
  const { isAdmin } = useWallet();

  if (!isAdmin) return <div className="text-red-500 font-bold text-center mt-10">Access Denied</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Registry</h2>
      <UserTable />
    </div>
  );
}