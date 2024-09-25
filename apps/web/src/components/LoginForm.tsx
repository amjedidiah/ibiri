'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IbiriLogo, Spinner } from '../assets';
import useLogin from '../hooks/use-login';

export default function LoginForm() {
  const {
    loading,
    handleSubmit,
    email,
    password,
    setEmail,
    setPassword,
  } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4 md:px-9 chromebook:px-0">
      <IbiriLogo fillColor="#3D4EE3" width={200} height={100} />
      <div className="w-full max-w-md space-y-8 relative z-[1] bg-white border border-gray-200 rounded-xl p-5 shadow-sm mt-5">
        <h2 className="text-center text-2xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
          <div className="">
            <div>
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
                placeholder="Enter your email address"
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
                autoComplete="current-password"
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
              {loading ? <Spinner /> : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          Don&#39;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-primary-bg hover:opacity-95"
          >
            Register Here
          </Link>
        </div>
      </div>
      <Image
        className="absolute bottom-0 left-0 z-0"
        src="/images/gradientBlob.svg"
        alt="Gradient Blob"
        fill
      />
    </div>
  );
}
