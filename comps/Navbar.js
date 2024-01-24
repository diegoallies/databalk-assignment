import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  return (
    <nav>
      <div className="logo">
        <Image src="/logo.png" alt="site logo" width={228} height={77} />
      </div>
      <Link href="/dashboard"><a>Dashboard</a></Link>
      <Link href="/login"><a>logout</a></Link>
    </nav>
  );
}
 
export default Navbar;