'use client';

import { useEffect, useState } from 'react';
import { LogOut, User, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // Prevent loop
  const router = useRouter();

  useEffect(() => {
    if (authChecked) return; // Skip if already checked

    const verifyAuth = async () => {
      try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `Fetch failed with status ${response.status}`);
        }

        if (!data.user.profileComplete) {
          console.log('⚠️ Profile incomplete, redirecting to /complete-profile');
          router.push('/complete-profile');
          return;
        }

        if (!data.user.isVendor) {
          console.log('⚠️ Not a vendor, redirecting to /dashboard');
          router.replace('/dashboard'); // Use replace to avoid history stack issues
          return;
        }

        console.log('✅ User authenticated:', data.user.email);
        console.log('   School:', data.user.school);
        setUser(data.user);

      } catch (error) {
        console.error('Auth error:', error.message, { status: error.status });
        router.replace('/login'); // Use replace to avoid loop
      } finally {
        setLoading(false);
        setAuthChecked(true); // Mark auth as checked
      }
    };

    verifyAuth();
  }, [router, authChecked]);

  const handleLogout = async () => {
    try {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 w-64 h-screen bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">🛒</span>
            </div>
            <span className="font-bold text-lg text-foreground">UniMart</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground font-medium"
          >
            <ShoppingBag className="w-5 h-5" />
            My Products
          </Link>
          <Link
            href="/dashboard/create-product"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground font-medium"
          >
            <span className="text-lg">+</span>
            Add Product
          </Link>
        </nav>
        <div className="p-4 border-t border-border space-y-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground font-medium"
          >
            <User className="w-5 h-5" />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition text-destructive font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <header className="md:hidden bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">🛒</span>
            </div>
            <span className="font-bold text-lg text-foreground">UniMart</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <LogOut className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      <main className="md:ml-64">
        {children}
      </main>
    </div>
  );
}






// 'use client';

// import { useEffect, useState } from 'react';
// import { LogOut, User, ShoppingBag } from 'lucide-react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';

// export default function DashboardLayout({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const verifyAuth = async () => {
//       try {
//         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
//         if (!token) {
//           console.log('❌ No token found, redirecting to login');
//           router.push('/login');
//           return;
//         }

//         const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        
//         if (userData) {
//           try {
//             const user = JSON.parse(userData);
//             console.log('✅ User authenticated:', user.email);
//             console.log('   School:', user.school);
//             setUser(user);
//           } catch (e) {
//             console.error('Error parsing user data:', e);
//             router.push('/login');
//             return;
//           }
//         } else {
//           console.log('⚠️ No user data found');
//           setUser({ authenticated: true });
//         }

//       } catch (error) {
//         console.error('Auth error:', error);
//         router.push('/login');
//       } finally {
//         setLoading(false);
//       }
//     };

//     verifyAuth();
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     router.push('/login');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin mb-4">
//             <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full"></div>
//           </div>
//           <p className="text-muted-foreground">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Sidebar Navigation */}
//       <aside className="fixed left-0 top-0 w-64 h-screen bg-card border-r border-border hidden md:flex flex-col">
//         {/* Logo */}
//         <div className="p-6 border-b border-border">
//           <Link href="/" className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
//               <span className="text-primary-foreground font-bold">🛒</span>
//             </div>
//             <span className="font-bold text-lg text-foreground">UniMart</span>
//           </Link>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-4 space-y-2">
//           <Link
//             href="/dashboard"
//             className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground font-medium"
//           >
//             <ShoppingBag className="w-5 h-5" />
//             My Products
//           </Link>
//           <Link
//             href="/dashboard/create-product"
//             className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground font-medium"
//           >
//             <span className="text-lg">+</span>
//             Add Product
//           </Link>
//         </nav>

//         {/* User Section */}
//         <div className="p-4 border-t border-border space-y-3">
//           <Link
//             href="/profile"
//             className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition text-foreground font-medium"
//           >
//             <User className="w-5 h-5" />
//             Profile
//           </Link>
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition text-destructive font-medium"
//           >
//             <LogOut className="w-5 h-5" />
//             Logout
//           </button>
//         </div>
//       </aside>

//       {/* Mobile Header */}
//       <header className="md:hidden bg-card border-b border-border sticky top-0 z-30">
//         <div className="flex items-center justify-between p-4">
//           <Link href="/" className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
//               <span className="text-primary-foreground font-bold">🛒</span>
//             </div>
//             <span className="font-bold text-lg text-foreground">UniMart</span>
//           </Link>
//           <button
//             onClick={handleLogout}
//             className="p-2 hover:bg-secondary rounded-lg transition"
//           >
//             <LogOut className="w-5 h-5 text-foreground" />
//           </button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="md:ml-64">
//         {children}
//       </main>
//     </div>
//   );
// }