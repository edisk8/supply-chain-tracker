import { useContext } from "react";
import { Web3Context } from "@/context/Web3Context";

export function useWallet() {
  const context = useContext(Web3Context);

  if (context === undefined) {
    throw new Error("useWallet must be used within a Web3Provider");
  }

  return {
    // Basic Wallet Info
    account: context.account,
    isConnected: !!context.account,
    loading: context.loading,

    // Contract & Provider
    provider: context.provider,
    signer: context.signer,
    contract: context.contract,

    // User Roles & Status
    isAdmin: context.isAdminUser,
    role: context.userRole,
    status: context.userStatus, // 0:Pending, 1:Approved, 2:Rejected, 3:Canceled

    // Actions
    connect: context.connectWallet,
    disconnect: context.disconnectWallet,
    refreshUser: context.refreshUserData,
  };
}