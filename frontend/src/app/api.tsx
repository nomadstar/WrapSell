// filepath: /home/ignarch/GitHub/WrapSell/frontend/src/app/api.tsx

// Types based on your database schema
export interface User {
    wallet_address: string;
    wallet_type: string;
    username?: string;
    email?: string;
}

export interface Card {
    id: number;
    name: string;
    card_id: string;
    edition?: string;
    user_wallet?: string;
    url?: string;
    market_value?: number;
    in_pool: boolean;
}

export interface Transaction {
    id: number;
    user_wallet?: string;
    transaction_type?: string;
    card_id: number;
    amount?: number;
    stablecoins_involved?: number;
    commission: number;
    transaction_date: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// User queries
export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
};

export const getUserByWallet = async (walletAddress: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
};

export const createUser = async (user: Omit<User, 'wallet_address'> & { wallet_address: string }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
};

// Card queries
export const getCards = async (): Promise<Card[]> => {
    const response = await fetch(`${API_BASE_URL}/cards`);
    if (!response.ok) throw new Error('Failed to fetch cards');
    return response.json();
};

export const getCardsByUser = async (walletAddress: string): Promise<Card[]> => {
    const response = await fetch(`${API_BASE_URL}/cards/user/${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch user cards');
    return response.json();
};

export const getCardsInPool = async (): Promise<Card[]> => {
    const response = await fetch(`${API_BASE_URL}/cards/pool`);
    if (!response.ok) throw new Error('Failed to fetch pool cards');
    return response.json();
};

export const createCard = async (card: Omit<Card, 'id'>): Promise<Card> => {
    const response = await fetch(`${API_BASE_URL}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
    });
    if (!response.ok) throw new Error('Failed to create card');
    return response.json();
};

export const updateCard = async (id: number, card: Partial<Card>): Promise<Card> => {
    const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
    });
    if (!response.ok) throw new Error('Failed to update card');
    return response.json();
};

export const deleteCard = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete card');
};
// Transaction queries
export const getTransactions = async (): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
};

export const getTransactionsByUser = async (walletAddress: string): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions/user/${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch user transactions');
    return response.json();
};
export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
};
export const updateTransaction = async (id: number, transaction: Partial<Transaction>): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
};
export const deleteTransaction = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
};
