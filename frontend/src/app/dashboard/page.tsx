'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  RefreshCw, 
  LogOut, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  Shield,
  Users,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

const Dashboard = () => {
  const [walletBalance, setWalletBalance] = useState(2.3458);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(12847.32);
  const [isConnected, setIsConnected] = useState(true);
  const [selectedPool, setSelectedPool] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [userPools, setUserPools] = useState([]);
  const [notification, setNotification] = useState(null);

  // Fake crypto metrics
  const [cryptoMetrics] = useState({
    btc: { price: 43250.75, change: 2.45, volume: '24.8B' },
    eth: { price: 2580.32, change: -1.23, volume: '15.6B' },
    ada: { price: 0.487, change: 5.67, volume: '890M' },
    sol: { price: 98.45, change: 3.21, volume: '2.1B' }
  });

  // Fake investment pools
  const [investmentPools] = useState([
    {
      id: 1,
      name: 'DeFi Yield Maximizer',
      apy: 12.5,
      tvl: '45.2M',
      risk: 'Medium',
      description: 'Automated yield farming across multiple DeFi protocols',
      minInvestment: 0.1,
      participants: 1247,
      contractAddress: '0x1234...5678',
      token: 'ETH',
      category: 'DeFi'
    },
    {
      id: 2,
      name: 'Stablecoin Fortress',
      apy: 8.2,
      tvl: '128.7M',
      risk: 'Low',
      description: 'Conservative stablecoin lending with high security',
      minInvestment: 50,
      participants: 3421,
      contractAddress: '0xabcd...efgh',
      token: 'USDC',
      category: 'Lending'
    },
    {
      id: 3,
      name: 'NFT Gaming Alpha',
      apy: 24.8,
      tvl: '12.4M',
      risk: 'High',
      description: 'High-yield gaming token staking with bonus rewards',
      minInvestment: 0.05,
      participants: 856,
      contractAddress: '0x9876...5432',
      token: 'ETH',
      category: 'Gaming'
    },
    {
      id: 4,
      name: 'Layer 2 Liquidity Hub',
      apy: 15.7,
      tvl: '67.8M',
      risk: 'Medium',
      description: 'Provide liquidity across Layer 2 solutions',
      minInvestment: 0.2,
      participants: 2103,
      contractAddress: '0xdef0...1234',
      token: 'ETH',
      category: 'Liquidity'
    }
  ]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    showNotification('Wallet disconnected successfully', 'info');
  };

  const handleInvest = () => {
    if (!selectedPool || !investmentAmount) return;
    
    const amount = parseFloat(investmentAmount);
    if (amount < selectedPool.minInvestment) {
      showNotification(`Minimum investment is ${selectedPool.minInvestment} ${selectedPool.token}`, 'error');
      return;
    }

    if (amount > walletBalance) {
      showNotification('Insufficient balance', 'error');
      return;
    }

    // Simulate investment
    const newTransaction = {
      id: Date.now(),
      type: 'Investment',
      pool: selectedPool.name,
      amount: amount,
      token: selectedPool.token,
      timestamp: new Date().toISOString(),
      status: 'Confirmed'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setWalletBalance(prev => prev - amount);
    
    // Add to user pools or update existing
    const existingPoolIndex = userPools.findIndex(p => p.id === selectedPool.id);
    if (existingPoolIndex >= 0) {
      setUserPools(prev => prev.map((pool, index) => 
        index === existingPoolIndex 
          ? { ...pool, invested: pool.invested + amount }
          : pool
      ));
    } else {
      setUserPools(prev => [...prev, {
        ...selectedPool,
        invested: amount,
        earnedRewards: 0
      }]);
    }

    setShowInvestModal(false);
    setInvestmentAmount('');
    setSelectedPool(null);
    showNotification(`Successfully invested ${amount} ${selectedPool.token} in ${selectedPool.name}`, 'success');
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'DeFi': return <Zap className="w-4 h-4" />;
      case 'Lending': return <Shield className="w-4 h-4" />;
      case 'Gaming': return <Target className="w-4 h-4" />;
      case 'Liquidity': return <Activity className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md w-full">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Disconnected</h2>
          <p className="text-gray-600 mb-6">You have been disconnected from your wallet. Please reconnect to continue.</p>
          <button
            onClick={() => setIsConnected(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            Reconnect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WrapSell Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your crypto investments</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-xl shadow-lg flex items-center space-x-3 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
             notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
             <Activity className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Wallet Balance</h3>
            <p className="text-2xl font-bold text-gray-900">{walletBalance.toFixed(4)} ETH</p>
            <p className="text-sm text-gray-500">${(walletBalance * cryptoMetrics.eth.price).toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Portfolio Value</h3>
            <p className="text-2xl font-bold text-gray-900">${totalPortfolioValue.toLocaleString()}</p>
            <p className="text-sm text-green-600 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +12.5% (24h)
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Active Pools</h3>
            <p className="text-2xl font-bold text-gray-900">{userPools.length}</p>
            <p className="text-sm text-gray-500">Total invested</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Rewards</h3>
            <p className="text-2xl font-bold text-gray-900">
              {userPools.reduce((acc, pool) => acc + pool.earnedRewards, 0).toFixed(4)} ETH
            </p>
            <p className="text-sm text-green-600">Earned this month</p>
          </div>
        </div>

        {/* Crypto Metrics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(cryptoMetrics).map(([symbol, data]) => (
              <div key={symbol} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 uppercase">{symbol}</span>
                  {data.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-lg font-bold text-gray-900">${data.price.toLocaleString()}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className={`${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.change >= 0 ? '+' : ''}{data.change}%
                  </span>
                  <span className="text-gray-500">{data.volume}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Investment Pools */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Investment Pools</h2>
                <p className="text-gray-600">Discover and invest in various DeFi opportunities</p>
              </div>
              <div className="p-6 space-y-4">
                {investmentPools.map((pool) => (
                  <div key={pool.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getCategoryIcon(pool.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{pool.name}</h3>
                          <p className="text-sm text-gray-600">{pool.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pool.risk)}`}>
                        {pool.risk}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">APY</p>
                        <p className="font-semibold text-green-600">{pool.apy}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">TVL</p>
                        <p className="font-semibold text-gray-900">${pool.tvl}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Min Investment</p>
                        <p className="font-semibold text-gray-900">{pool.minInvestment} {pool.token}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Participants</p>
                        <p className="font-semibold text-gray-900">{pool.participants.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 font-mono">
                        {pool.contractAddress}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPool(pool);
                          setShowInvestModal(true);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Invest</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Investments */}
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Investments</h3>
              </div>
              <div className="p-6">
                {userPools.length > 0 ? (
                  <div className="space-y-4">
                    {userPools.map((pool) => (
                      <div key={pool.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{pool.name}</span>
                          <span className="text-xs text-green-600">{pool.apy}% APY</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Invested: {pool.invested} {pool.token}</span>
                          <span className="text-green-600">+{pool.earnedRewards.toFixed(4)} {pool.token}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No investments yet</p>
                    <p className="text-sm text-gray-400">Start investing to see your portfolio here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              <div className="p-6">
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.type}</p>
                          <p className="text-xs text-gray-500">{tx.pool}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{tx.amount} {tx.token}</p>
                          <span className="text-xs text-green-600">{tx.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No transactions yet</p>
                    <p className="text-sm text-gray-400">Your transaction history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Invest in {selectedPool.name}</h3>
              <button
                onClick={() => setShowInvestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">APY:</span>
                    <span className="font-semibold text-green-600 ml-2">{selectedPool.apy}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Risk:</span>
                    <span className={`font-semibold ml-2 ${
                      selectedPool.risk === 'Low' ? 'text-green-600' :
                      selectedPool.risk === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{selectedPool.risk}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Min:</span>
                    <span className="font-semibold ml-2">{selectedPool.minInvestment} {selectedPool.token}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Balance:</span>
                    <span className="font-semibold ml-2">{walletBalance.toFixed(4)} ETH</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount ({selectedPool.token})
                </label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Min: ${selectedPool.minInvestment}`}
                  step="0.01"
                  min={selectedPool.minInvestment}
                  max={walletBalance}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowInvestModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Invest Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;