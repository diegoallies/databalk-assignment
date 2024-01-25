import { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, TextField, PrimaryButton, DefaultButton, Text } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

const stackStyles = { root: { width: '100%', maxWidth: '300px', margin: '0 auto' } };
const stackTokens = { childrenGap: 15 };
const textStyles = { root: { marginBottom: '2rem' } };

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user_name);
        localStorage.setItem('userEmail', data.user_email);
        localStorage.setItem('userId', data.user_id.toString());
      }
      router.push('/dashboard');
    } else {
      const errorData = await response.json();
      setError(errorData.message || 'An error occurred');
    }
  };

  return (
    <Stack 
      horizontalAlign="center" 
      verticalAlign="center" 
      verticalFill 
      styles={{
        root: { 
          margin: '0', // Adjusted margin to fix an issue where the 'auto' value caused a mismatch
          textAlign: 'center', 
          color: '#605e5c'
          // height: '100vh', // Make sure this Stack fills the viewport height
        }
      }}
    >
      <Text variant="xxLarge" styles={textStyles}>{isLogin ? 'Login' : 'Register'}</Text>
      <form onSubmit={handleSubmit}>
        <Stack tokens={stackTokens} styles={stackStyles}>
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