'use client';

import { useAuth } from '../context/AuthContext';
import { withAuth } from '../components/withAuth';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Ibiri</h1>
      {user && (
        <p className="text-xl">
          Hello, {user.firstName} {user.lastName}!
        </p>
      )}
      <button
        onClick={() => logout()}
        type="button"
        className="group relative w-[100px] mt-5 flex justify-center py-2 px-4 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
      >
        Log Out
      </button>
    </div>
  );
};

export default withAuth(Home);
