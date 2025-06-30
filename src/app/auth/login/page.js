'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {

      router.replace('/chats');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('user', JSON.stringify({
        name: data.username,
        token: data.token,
      }));
      router.replace('/chats');
      toast.success('Successfully logged in!')
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong');

    }


  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-orange-400"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">Login</h1>

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

        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition text-lg font-semibold"
        >
          Login
        </button>

        <p className="text-sm mt-4 text-center text-gray-400">
          Don&#39;t have an account?{' '}
          <Link href="/auth/signup" className="text-orange-500 font-medium underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}