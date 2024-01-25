import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Perform the local storage clearing in a useEffect to avoid hydration errors
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      
      // Redirect after ensuring local storage is cleared
      // window.location.href = '/login';
    }
  };

  useEffect(() => {
    // Your logic for detecting the logout condition and redirecting if needed
  }, []); // An empty dependency array will run this effect on initial component mount

  return (
    <nav>
      <div className="logo">
        <Image src="/logo.png" alt="site logo" width={200} height={60} />
      </div>
      <Link href="/dashboard"><a>Dashboard</a></Link>
      <Link href="/profile"><a>Profile</a></Link>
      <Link onClick={handleLogout} href="/login" style={{ cursor: 'pointer' }}>Logout</Link>
    </nav>
  );
};

export default Navbar;