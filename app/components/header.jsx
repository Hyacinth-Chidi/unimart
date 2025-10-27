
"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  MenuIcon,
  XIcon,
  UserIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  BoxIcon,
  HeartIcon,
  LogInIcon,
  UserPlusIcon,
  ShoppingCartIcon,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setProfileOpen(false);
    setMobileProfileOpen(false);
    router.push('/');
  };

  return (
    <header className="w-full shadow-sm bg-background border-b border-border sticky top-0 z-40">
      <nav className="flex items-center justify-between px-3 py-2 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          
        <ShoppingCartIcon className="size-6 text-primary" />
          
          <span className="text-xl font-bold text-primary hidden sm:inline">UniMart</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-3 items-center">
          <div className="relative">
            <button
              className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-secondary focus:outline-none transition"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <UserIcon className="size-5 text-primary" />
              {profileOpen ? (
                <ChevronUpIcon className="size-4 text-primary" />
              ) : (
                <ChevronDownIcon className="size-4 text-primary" />
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border z-50">
                <div className="px-4 py-3 border-b border-border">
                  {isLoggedIn ? (
                    <>
                      <span className="text-sm text-muted-foreground">Welcome back!</span>
                      <div className="font-semibold text-base text-foreground">
                        {user?.name || 'Student'}
                      </div>
                      {user?.school && (
                        <p className="text-xs text-muted-foreground mt-1">{user.school}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Welcome!</span>
                      <div className="font-semibold text-base text-foreground">
                        Sign in to your account
                      </div>
                    </>
                  )}
                </div>
                <ul className="py-2">
                  {isLoggedIn ? (
                    <>
                      <li>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                        >
                          <UserIcon className="size-4" /> My Profile
                        </Link>
                      </li>
                      {user?.isVendor && (
                        <li>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                          >
                            <BoxIcon className="size-4" /> My Store
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                        >
                          <BoxIcon className="size-4" /> My Orders
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                        >
                          <HeartIcon className="size-4" /> Wishlist
                        </Link>
                      </li>
                      <li className="border-t border-border">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 text-destructive transition"
                        >
                          <LogOutIcon className="size-4" /> Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          href="/login"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                        >
                          <LogInIcon className="size-4" /> Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/signup"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                        >
                          <UserPlusIcon className="size-4" /> Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="border-border text-primary flex items-center gap-1 hover:bg-secondary"
          >
            <ShoppingCartIcon className="size-5" />
            <span className="hidden sm:inline">Cart</span>
          </Button>

          {!isLoggedIn && (
            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-4">
          {/* Profile Dropdown (Mobile) */}
          <div className="relative">
            <button
              className="flex items-center gap-1 p-0 focus:outline-none"
              onClick={() => setMobileProfileOpen((open) => !open)}
            >
              <UserIcon className="size-6 text-primary" />
              {mobileProfileOpen ? (
                <ChevronUpIcon className="size-5 text-primary" />
              ) : (
                <ChevronDownIcon className="size-5 text-primary" />
              )}
            </button>

            {mobileProfileOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-card rounded-xl shadow-lg border border-border z-50">
                <div className="px-4 py-3 border-b border-border">
                  {isLoggedIn ? (
                    <>
                      <span className="text-sm text-muted-foreground">Welcome back!</span>
                      <div className="font-semibold text-base text-foreground">
                        {user?.name || 'Student'}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Welcome!</span>
                      <div className="font-semibold text-base text-foreground">
                        Sign in to your account
                      </div>
                    </>
                  )}
                </div>
                <ul className="py-2">
                  {isLoggedIn ? (
                    <>
                      <li>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                        >
                          <UserIcon className="size-4" /> My Profile
                        </Link>
                      </li>
                      {user?.isVendor && (
                        <li>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                          >
                            <BoxIcon className="size-4" /> My Store
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                        >
                          <BoxIcon className="size-4" /> My Orders
                        </Link>
                      </li>
                      <li className="border-t border-border">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-destructive/10 text-destructive transition"
                        >
                          <LogOutIcon className="size-4" /> Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          href="/login"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                        >
                          <LogInIcon className="size-4" /> Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/signup"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-secondary text-foreground transition"
                        >
                          <UserPlusIcon className="size-4" /> Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Cart Icon (Mobile) */}
          <div className="relative">
            <ShoppingCartIcon className="size-6 text-primary" />
            <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full px-2 py-0.5">
              0
            </span>
          </div>

          {/* Hamburger Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="text-primary"
              >
                <MenuIcon className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-background text-foreground"
            >
              <SheetHeader>
                <SheetTitle className="text-primary">Menu</SheetTitle>
                <span className="text-xl font-bold text-primary">UniMart</span>
              </SheetHeader>
              <ul className="flex flex-col gap-4 mt-4 text-base font-medium">
                <li>
                  <Link
                    href="/"
                    className="hover:text-primary text-foreground transition"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    className="hover:text-primary text-foreground transition"
                  >
                    Shop
                  </Link>
                </li>
                {isLoggedIn && user?.isVendor && (
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-primary text-foreground transition"
                    >
                      My Store
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/about"
                    className="hover:text-primary text-foreground transition"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-primary text-foreground transition"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-primary flex items-center gap-1"
                >
                  <ShoppingCartIcon className="size-5" />
                </Button>
                {!isLoggedIn ? (
                  <Link href="/login" className="flex-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-primary text-primary-foreground w-full"
                    >
                      Login
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLogout}
                    className="flex-1"
                  >
                    Logout
                  </Button>
                )}
              </div>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-primary"
                >
                  <XIcon className="size-5" />
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export default Header;







