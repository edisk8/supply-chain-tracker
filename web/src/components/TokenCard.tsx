import { TokenData } from "@/lib/web3";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight, Package, Info } from "lucide-react"; // Added Info icon

interface TokenCardProps {
  token: TokenData;
  userBalance?: number;
  onTransferClick?: (tokenId: number) => void;
  showTransferButton: boolean; 
}

export default function TokenCard({ 
  token, 
  userBalance, 
  onTransferClick, 
  showTransferButton 
}: TokenCardProps) {
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-slate-900" />
          <CardTitle className="text-sm font-medium text-slate-900">
            Token #{token.id}
          </CardTitle>
        </div>
        <span className="text-xs text-slate-500">
          {new Date(token.dateCreated * 1000).toLocaleDateString()}
        </span>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{token.name}</div>
        <p className="text-xs text-slate-500 mt-1">
          Total Supply: {token.totalSupply}
        </p>

       
        
        {userBalance !== undefined && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
             <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
               Your Balance
             </span>
             <div className="font-bold text-xl text-slate-900 font-mono">
               {userBalance}
             </div>
          </div>
        )}

        {token.parentId > 0 && (
          <div className="mt-2 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block font-medium">
            Derived from:  Token #{token.parentId}
          </div>
        )}

         {/* --- ADDED FEATURES FIELD --- */}
        {token.features && (
          <div className="mt-3">
            <div className="flex items-center gap-1 mb-1">
              <Info className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Technical Features
              </span>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
              {token.features.toString()}
            </p>
          </div>
        )}
        {/* ---------------------------- */}

        <div className="mt-4">
          {showTransferButton && onTransferClick ? (
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white" 
              onClick={() => onTransferClick(token.id)}
            >
              Transfer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="w-full text-center py-2 bg-slate-100 rounded text-[11px] text-slate-500 font-medium uppercase tracking-tight">
              Chain End-Destination
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}