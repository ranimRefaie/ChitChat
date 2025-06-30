'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ProfileForm from '@/components/ProfileForm';

export default function CompleteProfilePage() {
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('/user.png');
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/auth/login');
    } else {
      const parsed = JSON.parse(user);
      setUsername(parsed.name || parsed.username || '');
    }
  }, []);

const handleSubmit = async ({ username, bio, avatarFile }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user?.token) return;

  const formData = new FormData();
  formData.append('bio', bio);
  formData.append('username', username); 
  if (avatarFile) {
    formData.append('profilePic', avatarFile);
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to update');
    const data = await res.json();

    localStorage.setItem(
      'user',
      JSON.stringify({
        ...user,
        bio: data.bio,
        profilePic: {
          url: data.profilePic,
          thumbnail: data.profilePicThumb,
        },
      })
    );

    toast.success('Profile completed successfully 🎉');
    setTimeout(() => router.push('/chats'), 1500);
  } catch (err) {
    console.error(err);
    toast.error('Something went wrong, please try again.');
  }
};

  return (
    <ProfileForm
  defaultUsername={username}
  defaultBio={bio}
  defaultAvatar={avatarPreview}
  readOnlyUsername={true}
  onSubmit={handleSubmit}
  submitText="Continue"
  title="Complete Your Profile"
  backUrl="/auth/login"
/>
   
  );
}