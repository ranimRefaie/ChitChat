'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('Available');
  const [avatar, setAvatar] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUsername(user.username || '');
      setBio(user.bio || 'Available');
      setAvatar(user.avatar || '');
    }
  }, []);

  const handleSave = () => {
    const updatedUser = { username, bio, avatar };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    router.push('/chat');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />
        <textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 mb-4 border rounded resize-none"
        />
        <div className="mb-4">
          <label className="block mb-1">Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleAvatarUpload} />
          {avatar && (
            <img
              src={avatar}
              alt="Avatar Preview"
              className="w-20 h-20 mt-2 rounded-full object-cover"
            />
          )}
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}