import { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, TextField, PrimaryButton, DefaultButton, Text } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

const Login = () => {
  const router = useRouter();
  const [isLogin, { toggle: toggleMode }] = useBoolean(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`${isLogin ? 'Login' : 'Register'} Successful`, data);
      localStorage.setItem('token', data.token);  // Save the token securely
      localStorage.setItem('userEmail', email);  // Saving user email to localStorage
      if (isLogin) {
        router.push('/dashboard');
      }
    } else {
      const errorData = await response.json();
      setError(errorData.message || 'An error occurred');
    }
  };

  return (
    <Stack horizontalAlign="center" verticalAlign="center" verticalFill styles={{ root: { margin: '0 auto', textAlign: 'center', color: '#605e5c' } }}>
      <Text variant="xxLarge" styles={{ root: { marginBottom: '2rem' } }}>{isLogin ? 'Login' : 'Register'}</Text>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }}>
        <Stack tokens={{ childrenGap: 15 }}>
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e, newValue) => setEmail(newValue || '')}
          />
          <TextField
            label="Password"
            type="password"
            canRevealPassword
            required
            value={password}
            onChange={(e, newValue) => setPassword(newValue || '')}
          />
          <PrimaryButton text={isLogin ? 'Log In' : 'Register'} type="submit" />
          {error && <Text variant="smallPlus" styles={{ root: { color: 'red' } }}>{error}</Text>}
          <DefaultButton text={isLogin ? 'Need an account? Register' : 'Have an account? Login'} onClick={toggleMode} />
        </Stack>
      </form>
    </Stack>
  );
};

export default Login;