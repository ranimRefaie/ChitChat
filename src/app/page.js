'use client';
import { useRouter } from 'next/navigation';
import { FaArrowRight } from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();

  const handleStart = () => {
    router.replace('/auth/login');
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
        className="flex items-center gap-2 mb-10 bg-orange-400 text-white px-6 py-3 rounded-full shadow hover:bg-orange-500 transition cursor-pointer"
      >
        LogIn
        <FaArrowRight />
      </button>
    </div>
  );
}