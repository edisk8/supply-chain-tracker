"use client";

import React, { createContext, useEffect, useState, ReactNode } from "react";
import { ethers, BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { CONTRACT_CONFIG } from "@/contracts/config"; 

// Define the shape of our context
interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  isAdminUser: boolean;
  userRole: string | null;
  userStatus: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUserData: () => Promise<void>;
  loading: boolean;
}

export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  // Global State
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  
  // User Data State
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Initialization & Auto-Reconnection
  useEffect(() => {
    const init = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(_provider);

        // Check localStorage for persistence
        const isConnected = localStorage.getItem("isWalletConnected");

        if (isConnected === "true") {
          const accounts = await _provider.listAccounts();
          if (accounts.length > 0) {
            await handleAccountSetup(_provider, accounts[0].address);
          }
        }
        setLoading(false);

        // 2. MetaMask Events Management
        window.ethereum.on("accountsChanged", async (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            await handleAccountSetup(_provider, newAccounts[0]);
          } else {
            disconnectWallet();
          }
        });

        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } else {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  // Helper to setup account and fetch data
  const handleAccountSetup = async (currentProvider: BrowserProvider, address: string) => {
    try {
      const _signer = await currentProvider.getSigner();
      
      // ✅ Use Config for instantiation
      const _contract = new ethers.Contract(
        CONTRACT_CONFIG.address, 
        CONTRACT_CONFIG.abi, 
        _signer
      );

      setAccount(address);
      setSigner(_signer);
      setContract(_contract);
      
      // Persistence: Save flag
      localStorage.setItem("isWalletConnected", "true");

      await fetchUserData(_contract, address);
    } catch (error) {
      console.error("Error setting up account:", error);
    }
  };

  const fetchUserData = async (currentContract: Contract, address: string) => {
    try {

// ---------------- ADD THESE LOGS ----------------
      console.log("--- DEBUGGING CONNECTION ---");
      console.log("1. User Address:", address);
      console.log("2. Contract Address Target:", currentContract.target); // or currentContract.address
      console.log("3. Expected Address:", CONTRACT_CONFIG.address);
      
      const provider = currentContract.runner?.provider;
      if (provider) {
         const net = await provider.getNetwork();
         console.log("4. Current Network Chain ID:", net.chainId);
      }
      // ------------------------------------------------

      const _isAdmin = await currentContract.isAdmin(address);
      setIsAdminUser(_isAdmin);

      try {
        const info = await currentContract.getUserInfo(address);
        setUserRole(info.role);
        setUserStatus(Number(info.status));
      } catch (err) {
        // User not registered
        setUserRole(null);
        setUserStatus(null);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const connectWallet = async () => {
    if (!provider) return;
    try {
      setLoading(true);
      await provider.send("eth_requestAccounts", []);
      const _signer = await provider.getSigner();
      const address = await _signer.getAddress();
      await handleAccountSetup(provider, address);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setIsAdminUser(false);
    setUserRole(null);
    setUserStatus(null);
    localStorage.removeItem("isWalletConnected");
  };

  const refreshUserData = async () => {
    if (contract && account) {
      await fetchUserData(contract, account);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        contract,
        isAdminUser,
        userRole,
        userStatus,
        connectWallet,
        disconnectWallet,
        refreshUserData,
        loading,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}