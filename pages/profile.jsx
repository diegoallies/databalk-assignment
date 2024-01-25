import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, TextField, PrimaryButton, Text } from '@fluentui/react';

const Profile = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({ userName: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.user_email) {
        setUserProfile({
          userName: data.user_name || '',
          email: data.user_email || '',
        });
      } else {
        throw new Error('User data could not be loaded.');
      }
    })
    .catch(error => {
      console.error('Error loading user profile:', error);
      setError(error.message);
    })
    .finally(() => setIsLoading(false));
  }, []);

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    fetch('/api/auth/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ user_name: userProfile.userName }),
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
    })
    .catch(error => {
      console.error('Error updating profile:', error);
      setError(error.message);
    })
    .finally(() => setIsLoading(false));
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    fetch('/api/auth/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ newPassword }),
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      setNewPassword('');
    })
    .catch(error => {
      console.error('Error changing password:', error);
      setError(error.message);
    })
    .finally(() => setIsLoading(false));
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    fetch('/api/auth/user', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      localStorage.clear();
      router.push('/login');
    })
    .catch(error => {
      console.error('Error deleting account:', error);
      setError(error.message);
    })
    .finally(() => setIsLoading(false));
  };

  return (
    <Stack tokens={{ childrenGap: 25 }} styles={{ root: { padding: '20px', margin: '0 auto', maxWidth: '700px' } }}>
      <Text variant="xLarge">Profile</Text>

      {error && <Text styles={{ root: { color: '#d13438' } }}>{error}</Text>}

      <TextField
        label="User Name"
        value={userProfile.userName}
        onChange={(_, newValue) => setUserProfile({ ...userProfile, userName: newValue || userProfile.userName })}
        disabled={isLoading}
      />

      <TextField
        label="Email"
        value={userProfile.email}
        disabled // Email is assumed to not be editable
      />

      <PrimaryButton text="Update Profile" onClick={handleProfileUpdate} disabled={isLoading || !userProfile.userName} />

      <Text variant="xLarge">Change Password</Text>

      <TextField
        label="New Password"
        type="password"
        canRevealPassword
        value={newPassword}
        onChange={(_, newValue) => setNewPassword(newValue || '')}
        disabled={isLoading}
      />

      <PrimaryButton text="Update Password" onClick={handlePasswordChange} disabled={isLoading || !newPassword} />

      <PrimaryButton text="Delete Account" onClick={handleDeleteAccount} disabled={isLoading} styles={{ root: { backgroundColor: '#d13438', borderColor: '#d13438' } }} />

      <PrimaryButton text="Back to Dashboard" onClick={() => router.push('/dashboard')} disabled={isLoading} />
    </Stack>
  );
};

export default Profile;