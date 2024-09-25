'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GradientBlob, IbiriLogo, Spinner } from '../assets/images';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const router = useRouter();
  const { loginContext } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || 'Something went wrong');
      setLoading(false);
      return;
    }

    // Registration Success
    loginContext(data.user);
    router.push('/');
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 md:px-9 chromebook:px-0">
      <IbiriLogo fillColor="#3D4EE3" width={200} height={100} />
      <div className="w-full max-w-md space-y-8 relative z-[1] bg-white border border-gray-200 rounded-xl p-5 shadow-sm mt-5">
        <h2 className="text-center text-2xl font-extrabold text-gray-900">
          Register a new account
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="">
            <div>
              <label htmlFor="first-name" className="b-1 text-sm">
                First Name
              </label>
              <input
                id="first-name"
                name="first-name"
                type="text"
                required
                className="appearance-none h-12 rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mt-2 relative">
              <label htmlFor="last-name" className="mb-1 text-sm">
                Last Name
              </label>
              <input
                id="last-name"
                name="last-name"
                type="text"
                required
                className="appearance-none h-12 rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="mt-2 relative">
              <label htmlFor="email-address" className="mb-1 text-sm">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none h-12 rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-2 relative">
              <label htmlFor="password" className="mb-1 text-sm">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="appearance-none h-12 rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute top-1/2 -translate-y-1/2 mt-[12px] right-[10px] flex items-center text-md leading-5 z-50"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full h-12 flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-bg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Register'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          Already Have an Account ?{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Login here
          </Link>
        </div>
      </div>
      <Image
        className="absolute bottom-0 left-0 z-0"
        src={GradientBlob}
        alt="Gradient Blob"
      />
    </div>
  );
}
