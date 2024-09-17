'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { withAuth } from '../components/withAuth';

const Home = () => {
  const { user, setUser, logout } = useAuth();
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        
      } else {
        console.error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [setUser]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const handleTransfer = async () => {
    if (!accountNumber || !amount || isNaN(Number(amount))) {
      setMessage('Please enter a valid account number and amount');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderAccountNumber: user?.bankAccount[0].accountNumber,
          recipientAccountNumber: accountNumber,
          amount: Number(amount),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await refreshUserData(); // Refresh user data after a successful transfer
        setMessage('Transfer successful');
      } else {
        setMessage(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Error making transfer:', error);
      setMessage('An error occurred while processing the transfer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Ibiri</h1>
      {user ? (
        <p className="text-xl">
          Hello, {user.firstName} {user.lastName}!
        </p>
      ) : (
        ''
      )}
      <button
        onClick={() => logout()}
        type="button"
        className="group relative w-[100px] mt-5 flex justify-center py-2 px-4 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
      >
        Log Out
      </button>
      <h2 className="text-2xl font-bold mt-5">Your Account Details:</h2>
      {user && user.bankAccount && user.bankAccount[0] && (
        <div className="mt-4">
          <p className="text-lg">
            <span className="font-semibold">Account Number:</span>{' '}
            {user.bankAccount[0].accountNumber}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Balance:</span>{' '}
            {user.bankAccount[0].balance}
          </p>
        </div>
      )}
      {user && user.creditScore && user.creditScore[0] && (
        <div className="mt-2">
          <p className="text-lg">
            <span className="font-semibold">Credit Score:</span>{' '}
            {user.creditScore[0].score}
          </p>
        </div>
      )}
      <div className="mt-5">
        <h2 className="text-2xl font-bold">Transfer Money</h2>
        <input
          type="text"
          placeholder="Recipient Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="mt-2 p-2 border border-gray-300 rounded"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-2 p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleTransfer}
          type="button"
          disabled={loading}
          className="mt-2 p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Transfer'}
        </button>
        {message && <p className="mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default withAuth(Home);
