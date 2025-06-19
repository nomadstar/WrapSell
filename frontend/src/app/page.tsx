'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Database, Zap, RefreshCw, LogOut } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useRouter } from 'next/navigation';
import { getUserByWallet, createUser } from './api'; // Import API functions
const SIMPLE_STORAGE_CONTRACT_ADDRESS = "0xcb8b317ef7e5f5afb641813e07177cbd791bf8e";

// Simple Storage ABI
const SIMPLE_STORAGE_ABI = [
  {
    "inputs": [],
    "name": "get",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_value", "type": "uint256" }],
    "name": "set",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ... (keep existing Navbar and Hero components unchanged)
// Placeholder components - replace with your actual components
const Navbar = () => <nav className="bg-white shadow-sm border-b">Navigation</nav>;
const Hero = () => <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 text-center">Hero Section</div>;
const StatusMessage = ({ message, type }: { message: string; type: string }) => (
  <div className={`p-4 rounded-lg mb-4 ${type === 'success' ? 'bg-green-100 text-green-800' : type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
    {message}
  </div>
);

function WrapSellApp() {
  const { address, isConnected, connector } = useAccount();
  const { open } = useAppKit();
  const router = useRouter();
  const [newValue, setNewValue] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const { 
    data: contractValue, 
    isLoading: isReading, 
    refetch: refetchValue,
    error: readError 
  } = useReadContract({
    address: SIMPLE_STORAGE_CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'get',
    query: {
      enabled: isConnected,
    }
  }) as { data: bigint | undefined; isLoading: boolean; refetch: () => void; error: Error | null };

  // Write contract
  const { 
    writeContract, 
    data: writeData, 
    isPending: isWriting,
    error: writeError 
  } = useWriteContract();

  // Wait for transaction receipt
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const showMessage = (msg: string, type: string = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  // Function to check and add user to database
  const checkAndAddUser = async (walletAddress: string) => {
    if (!walletAddress) return;
    
    setIsCheckingUser(true);
    try {
      // First, try to get the user
      await getUserByWallet(walletAddress);
      console.log('User already exists in database');
    } catch (error) {
      // If user doesn't exist, create them
      console.log('User not found, creating new user...');
      try {
        const walletType = connector?.name || 'Unknown';
        await createUser({
          wallet_address: walletAddress,
          wallet_type: walletType,
        });
        console.log('User created successfully');
        showMessage("✅ User profile created successfully!", "success");
      } catch (createError) {
        console.error('Error creating user:', createError);
        showMessage("⚠️ Could not create user profile", "error");
      }
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Effect to check/add user when wallet connects
  useEffect(() => {
    if (isConnected && address && !isRedirecting && !isCheckingUser) {
      checkAndAddUser(address);
    }
  }, [isConnected, address, isRedirecting, isCheckingUser]);

  // Effect to redirect after user check is complete
  useEffect(() => {
    if (isConnected && address && !isRedirecting && !isCheckingUser) {
      setIsRedirecting(true);
      showMessage("🎉 Wallet connected! Redirecting to dashboard...", "success");
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  }, [isConnected, address, router, isRedirecting, isCheckingUser]);

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      showMessage("🚀 Transaction confirmed! Value updated successfully.", "success");
      setNewValue("");
      setTimeout(() => {
        refetchValue();
      }, 1000);
    }
  }, [isConfirmed, refetchValue]);

  // Handle errors
  useEffect(() => {
    if (readError) {
      showMessage(`❌ Error reading contract: ${readError.message}`, "error");
    }
  }, [readError]);

  useEffect(() => {
    if (writeError) {
      showMessage(`❌ Transaction failed: ${writeError.message}`, "error");
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      showMessage(`❌ Transaction confirmation failed: ${confirmError.message}`, "error");
    }
  }, [confirmError]);

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    setIsRedirecting(false);
    setIsCheckingUser(false);
    open();
  };

  const handleReadValue = () => {
    setMessage("");
    refetchValue();
    showMessage("✅ Contract value refreshed!", "success");
  };

  const handleWriteValue = async () => {
    if (newValue === "") {
      showMessage("Please enter a value to write", "error");
      return;
    }
    
    if (isNaN(Number(newValue)) || Number(newValue) < 0) {
      showMessage("Please enter a valid positive number", "error");
      return;
    }

    try {
      writeContract({
        address: SIMPLE_STORAGE_CONTRACT_ADDRESS,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'set',
        args: [BigInt(newValue)],
      });
      showMessage("📝 Transaction submitted! Waiting for confirmation...", "info");
    } catch (error) {
      console.error("Error writing value:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      showMessage(`❌ Transaction failed: ${errorMessage}`, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <Hero />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This dApp demonstrates real blockchain interactions with a Simple Storage contract.
            Connect your wallet to read and write values on the blockchain.
          </p>
          <div className="mt-4 text-sm text-gray-500 font-mono bg-gray-100 rounded-lg p-2 inline-block">
            Contract: {SIMPLE_STORAGE_CONTRACT_ADDRESS}
          </div>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
            {message && <StatusMessage message={message} type={messageType} />}

            {isConnected ? (
              <div className="space-y-8">
                {(isRedirecting || isCheckingUser) ? (
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="flex items-center justify-center mb-3">
                      <RefreshCw className="w-6 h-6 text-green-600 mr-2 animate-spin" />
                      <span className="font-semibold text-green-800">
                        {isCheckingUser ? "Setting up your profile..." : "Redirecting to Dashboard..."}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isCheckingUser ? "Please wait while we set up your account." : "Please wait while we redirect you to your dashboard."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                      <div className="flex items-center justify-center mb-3">
                        <Wallet className="w-6 h-6 text-green-600 mr-2" />
                        <span className="font-semibold text-green-800">Wallet Connected</span>
                      </div>
                      <p className="text-sm text-gray-600 font-mono break-all">
                        {address}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleReadValue}
                          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                          disabled={isReading}
                        >
                          <RefreshCw className={`w-5 h-5 ${isReading ? 'animate-spin' : ''}`} />
                          <span>{isReading ? "Reading..." : "Read Value"}</span>
                        </button>
                        
                        {contractValue !== undefined && contractValue !== null && (
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Current Value</p>
                            <p className="text-2xl font-bold text-green-600">
                              {contractValue.toString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="number"
                        placeholder="Enter new value (e.g., 42)"
                        className="w-full border border-gray-300 rounded-xl py-4 px-5 text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-inner"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        min="0"
                        disabled={isWriting || isConfirming}
                      />
                      <button
                        onClick={handleWriteValue}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                        disabled={isWriting || isConfirming}
                      >
                        <Database className={`w-5 h-5 ${(isWriting || isConfirming) ? 'animate-pulse' : ''}`} />
                        <span>
                          {isWriting ? "Sending Transaction..." : 
                           isConfirming ? "Confirming..." : 
                           "Write Value"}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="p-8">
                  <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Connect your wallet to start interacting with the smart contract
                  </p>
                  <button
                    onClick={handleConnect}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <Database className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">TCG Marketplace</h3>
            <p className="text-gray-600">Buy, sell, and discover your favorite TCG cards</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <Zap className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Crypto Payments</h3>
            <p className="text-gray-600">Use crypto to buy and sell cards safely and securely</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <Wallet className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Connection</h3>
            <p className="text-gray-600">Connect your wallet and start trading TCG cards</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WrapSellApp;