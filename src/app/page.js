'use client';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white py-12 px-4">
      <div className="w-full flex justify-start">
        <div className="w-[100%] md:w-[20%] rounded-full shadow-sm animate-pulse mx-auto">
          <img src='/chat.png' className='w-full'/>
        </div>
      </div>
  <div className="flex-1 flex flex-col justify-center items-center text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">ChitChat Message</h1>
       
      </div>
      
      <button
        onClick={handleStart}
        className="mb-10 bg-orange-500 text-white px-6 py-3 rounded-full shadow hover:bg-orange-600 transition cursor-pointer"
      >
        LogIn
      </button>
    </div>
  );
}