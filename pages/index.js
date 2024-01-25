import { useEffect } from 'react';
import { useRouter } from 'next/router';

function SomePage() {
  const router = useRouter();

  useEffect(() => {
    // Retrieve the 'userEmail' item from localStorage
    const userEmail = window.localStorage.getItem('userEmail');

    // Redirect the user to the login page if they're not logged in
    if (!userEmail) {
      router.push('/login');
    } else {
      // If the user is logged in, redirect them to the dashboard
      router.push('/dashboard');
    }
  }, [router]);

  // Display a loading message while the redirect is determined
  return <div>Loading...</div>;
}

export default SomePage;