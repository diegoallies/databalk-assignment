import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  return (
    <nav>
      <div className="logo">
        <Image src="/logo.png" alt="site logo" width={200} height={60} />
      </div>
      <Link href="/dashboard"><a>Dashboard</a></Link>
      <Link href="/profile"><a>Profile</a></Link>
      <Link href="/login"><a>logout</a></Link>
    </nav>
  );
}
 
export default Navbar;