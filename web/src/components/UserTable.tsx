// src/components/UserTable.tsx
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Web3Service } from "@/lib/web3";
import { Button } from "./ui/button";
// 👇 These imports are now used in the return statement below
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface UserData {
  id: number;
  address: string;
  role: string;
  status: number;
}

export default function UserTable() {
  const { signer, contract } = useWallet();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!contract || !signer) return;
    setLoading(true);
    try {
      const nextId = await contract.nextUserId();
      const tempUsers: UserData[] = [];
      
      for(let i = 1; i < Number(nextId); i++) {
        const u = await contract.users(i);
        if (u.userAddress !== "0x0000000000000000000000000000000000000000") {
          tempUsers.push({
            id: Number(u.id),
            address: u.userAddress,
            role: u.role,
            status: Number(u.status)
          });
        }
      }
      setUsers(tempUsers);
    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [signer]);

  const changeStatus = async (userAddr: string, newStatus: number) => {
    if (!signer) return;
    try {
      const service = new Web3Service(signer);
      await service.adminChangeStatus(userAddr, newStatus);
      await fetchUsers(); 
    } catch (e) {
      console.error(e);
      alert("Error changing status");
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="font-semibold text-slate-800">User Registry</h3>
          <p className="text-sm text-slate-500">Manage role requests and user permissions</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchUsers} 
          disabled={loading}
          className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
        >
          {loading ? "Syncing..." : "Refresh List"}
        </Button>
      </div>

      {/* 👇 NOTICE: We use <Table> instead of <table>, <TableRow> instead of <tr>, etc. */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>ID</TableHead>
            <TableHead>Wallet Address</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                No users registered in the system yet.
              </TableCell>
            </TableRow>
          )}
          
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium text-slate-500">#{u.id}</TableCell>
              
              <TableCell>
                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 select-all">
                  {u.address}
                </span>
              </TableCell>
              
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                  ${u.role === 'Producer' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                  ${u.role === 'Factory' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                  ${u.role === 'Retailer' ? 'bg-purple-50 text-purple-700 border-purple-100' : ''}
                  ${u.role === 'Consumer' ? 'bg-slate-50 text-slate-600 border-slate-200' : ''}
                `}>
                  {u.role}
                </span>
              </TableCell>

              <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold
                  ${u.status === 0 ? "bg-yellow-50 text-yellow-700 border border-yellow-100" : ""}
                  ${u.status === 1 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : ""}
                  ${u.status === 2 ? "bg-rose-50 text-rose-700 border border-rose-100" : ""}
                `}>
                  {u.status === 0 ? "Pending" : u.status === 1 ? "Approved" : "Rejected"}
                </span>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {u.status === 0 && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
                        onClick={() => changeStatus(u.address, 1)}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="bg-rose-600 hover:bg-rose-700 text-white h-7 text-xs" 
                        onClick={() => changeStatus(u.address, 2)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {u.status === 1 && (
                     <Button 
                       size="sm" 
                       variant="ghost" 
                       className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 h-7 text-xs"
                       onClick={() => changeStatus(u.address, 2)}
                     >
                       Revoke
                     </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}