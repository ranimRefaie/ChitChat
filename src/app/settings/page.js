'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('/user.png');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (!stored || !stored.token) {
      router.push('/auth/login');
      return;
    }

    setUser(stored);

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/profile`, {
      headers: {
        Authorization: `Bearer ${stored.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.name || '');
        setBio(data.bio || '');
        setAvatar(
          data.profilePic?.url
            ? data.profilePic.url
            : '/user.png'
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error', err);
        toast.error('Failed to load data from server');
      });
  }, []);

  const handleSubmit = async ({ username, bio, avatarFile }) => {
    if (!user?.token) return;

    const formData = new FormData();
    formData.append('bio', bio);
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

      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();

  
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...user,
          bio: updated.bio,
          profilePic: {
            url: updated.profilePic, 
          },
        })
      );

      toast.success('Profile updated successfully');
      router.push('/chats');
    } catch (err) {
      console.error(err);
      toast.error('Error saving data');
    }
  };

  return (
    <ProfileForm
      defaultUsername={username}
      defaultBio={bio}
      defaultAvatar={avatar}
      readOnlyUsername={true}
      submitText="Save"
      title="Edit Profile"
      onSubmit={handleSubmit}
      backLink="/chats"
    />
  );
}