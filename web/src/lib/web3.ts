import { ethers, Contract, JsonRpcSigner, BrowserProvider } from "ethers";
import { CONTRACT_CONFIG } from "@/contracts/config"; 

// Types corresponding to Solidity Structs
export interface UserData {
  id: number;
  address: string;
  role: string;
  status: number;
}

export interface TokenData {
  id: number;
  creator: string;
  name: string;
  totalSupply: number;
  features: string;
  parentId: number;
  dateCreated: number;
}

export interface TransferData {
  id: number;
  from: string;
  to: string;
  tokenId: number;
  tokenName?: string;
  dateCreated: number;
  amount: number;
  status: number; // 0: Pending, 1: Accepted, 2: Rejected
  fromRole?: string; // For Traceability View
  toRole?: string;   // For Traceability View
}

export class Web3Service {
  private contract: Contract;
  private signer: JsonRpcSigner;

  constructor(signer: JsonRpcSigner) {
    this.signer = signer;
    this.contract = new Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_CONFIG.abi,
      signer
    );
  }

  // ==========================================
  // 0. Static Connection Method (MetaMask & Network)
  // ==========================================

  static async connect(): Promise<{ signer: JsonRpcSigner; address: string }> {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error("MetaMask not detected");
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);

    // Request Account Access
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // Check and Switch Network (Anvil Localhost 8545)
    const network = await provider.getNetwork();
    const targetChainIdHex = "0x7a69"; // Hex for 31337
    const targetChainIdDec = 31337n;

    if (network.chainId !== targetChainIdDec) {
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: targetChainIdHex }]);
      } catch (switchError: any) {
        if (switchError.code === 4902) {
           await provider.send("wallet_addEthereumChain", [{
            chainId: targetChainIdHex,
            chainName: "Anvil Localhost",
            rpcUrls: ["http://127.0.0.1:8545"],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }
          }]);
        } else {
          throw switchError;
        }
      }
    }

    return { signer, address };
  }

  // ==========================================
  // 1. Utilities
  // ==========================================

  private formatBigInt(value: bigint | number): number {
    return Number(value);
  }

  private getErrorMessage(error: any): string {
    if (error.reason) return error.reason;
    if (error.data && error.data.message) return error.data.message;
    if (error.message) return error.message;
    return "Unknown transaction error";
  }

  // ==========================================
  // 2. User Management
  // ==========================================

  // async getUserInfo(userAddress: string): Promise<UserData> {
  //   try {
  //     const user = await this.contract.getUserInfo(userAddress);
  //     return {
  //       id: this.formatBigInt(user.id),
  //       address: user.userAddress,
  //       role: user.role,
  //       status: Number(user.status),
  //     };
  //   } catch (e) {
  //     console.error("Error in getUserInfo:", e);
  //     throw new Error("User not found in system");
  //   }
  // }

  async getUserInfo(userAddress: string): Promise<UserData> {
    try {
      // 1. Check if the address is the Admin first
      const adminAddress = await this.contract.admin();
      
      if (userAddress.toLowerCase() === adminAddress.toLowerCase()) {
        return {
          id: 0, // Admin doesn't need a specific User ID
          address: userAddress,
          role: "ADMIN",
          status: 1, // Automatically approved
        };
      }

      // 2. If not admin, proceed to fetch from the user mapping
      const user = await this.contract.getUserInfo(userAddress);
      
      return {
        id: this.formatBigInt(user.id),
        address: user.userAddress,
        role: user.role,
        status: Number(user.status),
      };
    } catch (e: any) {
      // 3. Graceful fallback for unregistered non-admin users
      if (e.message.includes("User not found") || e.data?.message?.includes("User not found")) {
        return {
          id: 0,
          address: userAddress,
          role: "",
          status: 0, 
        };
      }
      throw e;
    }
  }

  async requestUserRole(role: string): Promise<void> {
    try {
      const tx = await this.contract.requestUserRole(role);
      await tx.wait();
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async adminChangeStatus(userAddress: string, status: number): Promise<void> {
    try {
      const tx = await this.contract.changeStatusUser(userAddress, status);
      await tx.wait();
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getValidRecipients(targetRole: string) {
    try {
      const nextId = await this.contract.nextUserId();
      const recipients = [];
      
      for (let i = 1; i < Number(nextId); i++) {
        const u = await this.contract.users(i);
        if (Number(u.status) === 1 && u.role === targetRole) {
          recipients.push({
            address: u.userAddress,
            role: u.role
          });
        }
      }
      return recipients;
    } catch (e) {
      console.error("Error fetching recipients:", e);
      return [];
    }
  }

  // ==========================================
  // 3. Token Management & Traceability
  // ==========================================

  async createToken(
    name: string,
    totalSupply: number,
    features: Record<string, any>,
    parentId: number = 0
  ): Promise<void> {
    try {
      const featuresJson = JSON.stringify(features);
      const tx = await this.contract.createToken(
        name,
        BigInt(totalSupply),
        featuresJson,
        BigInt(parentId)
      );
      await tx.wait();
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getToken(tokenId: number): Promise<TokenData> {
    try {
      const data = await this.contract.getToken(BigInt(tokenId));
      return {
        id: this.formatBigInt(data.id),
        creator: data.creator,
        name: data.name,
        totalSupply: this.formatBigInt(data.totalSupply),
        features: data.features,
        parentId: this.formatBigInt(data.parentId),
        dateCreated: this.formatBigInt(data.dateCreated),
      };
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getUserTokens(userAddress: string): Promise<number[]> {
    try {
      const tokens: bigint[] = await this.contract.getUserTokens(userAddress);
      return tokens.map((t) => this.formatBigInt(t));
    } catch (error) {
      return [];
    }
  }

  async getTokenBalance(tokenId: number, userAddress: string): Promise<number> {
    try {
      const balance = await this.contract.getTokenBalance(BigInt(tokenId), userAddress);
      return this.formatBigInt(balance);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Enhanced Traceability Crawler
   * Fetches the transfer history and enriches it with the Role names
   */
  async getTokenHistory(tokenId: number): Promise<TransferData[]> {
    try {
      const nextTransferId = await this.contract.nextTransferId();
      const history: TransferData[] = [];

      for (let i = 1; i < Number(nextTransferId); i++) {
        const t = await this.getTransfer(i);
        
        // Only include Accepted transfers for the provenance path
        if (Number(t.tokenId) === tokenId && Number(t.status) === 1) {
          // Parallel fetch of roles to prevent UI lag
          const [fromInfo, toInfo] = await Promise.all([
            this.getUserInfo(t.from),
            this.getUserInfo(t.to)
          ]);

          history.push({
            ...t,
            fromRole: fromInfo.role,
            toRole: toInfo.role
          });
        }
      }

      return history.sort((a, b) => a.dateCreated - b.dateCreated);
    } catch (error) {
      console.error("Error fetching token history:", error);
      return [];
    }
  }

  // ==========================================
  // 4. Transfer Management
  // ==========================================

  async transferToken(to: string, tokenId: number, amount: number): Promise<void> {
    try {
      const tx = await this.contract.transfer(to, BigInt(tokenId), BigInt(amount));
      await tx.wait();
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async acceptTransfer(transferId: number): Promise<void> {
    try {
      const tx = await this.contract.acceptTransfer(BigInt(transferId));
      await tx.wait();
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async rejectTransfer(transferId: number): Promise<void> {
    try {
      const tx = await this.contract.rejectTransfer(BigInt(transferId));
      await tx.wait();
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getUserTransfers(userAddress: string): Promise<number[]> {
    try {
      const transferIds: bigint[] = await this.contract.getUserTransfers(userAddress);
      return transferIds.map((id) => this.formatBigInt(id));
    } catch (error) {
      return [];
    }
  }

  async getTransfer(transferId: number): Promise<TransferData> {
    try {
      const data = await this.contract.getTransfer(BigInt(transferId));
      return {
        id: this.formatBigInt(data.id),
        from: data.from,
        to: data.to,
        tokenId: this.formatBigInt(data.tokenId),
        dateCreated: this.formatBigInt(data.dateCreated),
        amount: this.formatBigInt(data.amount),
        status: Number(data.status),
      };
    } catch (error) {
      throw new Error("Transfer not found");
    }
  }
}