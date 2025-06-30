'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getSocket } from '@/lib/socket';

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [error, setError] = useState('');

const handleSignup = async (e) => {
  e.preventDefault();
  setError('');

  if (password !== verifyPassword) {
    setError("Passwords don't match");
    return;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'Signup failed');
      return;
    }

    localStorage.setItem('user', JSON.stringify(data));

    getSocket(data.name || data.username || username.trim().toLowerCase());

    toast.success('🎉 Account created! Let’s complete your profile');
    router.replace('/complete-profile');
  } catch (err) {
    setError('Something went wrong');
    toast.error('Something went wrong');
  }
};





  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-orange-400"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">Sign Up</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-300"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-300"
          required
        />

        <input
          type="password"
          placeholder="Verify Password"
          value={verifyPassword}
          onChange={(e) => setVerifyPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-300"
          required
        />

        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition text-lg font-semibold"
        >
          Register
        </button>

        <p className="text-sm mt-4 text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-orange-500 underline font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}



