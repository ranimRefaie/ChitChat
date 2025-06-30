'use client';

import { useState, useEffect } from 'react';
import { MdModeEdit } from 'react-icons/md';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function ProfileForm({
  defaultUsername = '',
  defaultBio = '',
  defaultAvatar = '/user.png',
  readOnlyUsername = false,
  onSubmit,
  submitText = 'Save',
  title = 'Edit Profile',
  backUrl = null, 
}) {
  const router = useRouter();
  const [username, setUsername] = useState(defaultUsername);
  const [bio, setBio] = useState(defaultBio);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    setUsername(defaultUsername);
    setBio(defaultBio);
    setAvatarPreview(defaultAvatar);
  }, [defaultUsername, defaultBio, defaultAvatar]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, bio, avatarFile });
  };

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center relative">
       
        <button
          onClick={handleBack}
          className="absolute left-4 top-4 text-orange-500 hover:text-orange-700 cursor-pointer"
          title="Back"
        >
          <FaArrowLeft size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-orange-600">{title}</h2>

       
        <div className="relative w-24 h-24 mx-auto mb-2">
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-full h-full object-cover rounded-full border"
          />
          <label
            htmlFor="avatarUpload"
            className="absolute bottom-0 right-0 bg-gray-300 p-1 rounded-full cursor-pointer hover:bg-gray-400 text-gray-600"
            title="Change Photo"
          >
            <MdModeEdit size={20} />
          </label>
          <input
            type="file"
            id="avatarUpload"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

   
        <input
          type="text"
          value={username}
          readOnly={readOnlyUsername}
          onChange={(e) => setUsername(e.target.value)}
          className={`w-full p-3 mb-4 border rounded text-gray-700 ${
            readOnlyUsername ? 'bg-gray-100' : ''
          }`}
        />


        <textarea
          placeholder="Write a short bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 mb-4 border rounded resize-none text-gray-600"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
        >
          {submitText}
        </button>
      </div>
    </div>
  );
}