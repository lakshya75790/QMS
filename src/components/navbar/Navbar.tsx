"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import UserButton from "@/components/buttons/UserButton";
import LoginButton from "@/components/buttons/LoginButton";
import NotificationBell from "@/components/notifications/NotificationBell";
import {
  Activity,
  Menu,
  X,
  Clock,
  Coins,
  LogOut,
  Layout,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navLinks = [
  { title: "Home", href: "/#home", id: "home" },
  { title: "How It Works", href: "/#how-it-works", id: "how-it-works" },
  { title: "Features", href: "/#features", id: "features" },
  { title: "For Clinics", href: "/#for-clinics", id: "for-clinics" },
  { title: "Security", href: "/#security", id: "security" },
];

const Navbar = () => {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const user = useCurrentUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (id: string) => {
    if (typeof window === "undefined") return;
    const targetEl = document.getElementById(id);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
      if (window.location.hash !== `#${id}`) {
        window.history.pushState(null, "", `#${id}`);
      }
    } else if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("home");
      if (window.location.hash !== "" && window.location.hash !== "#home") {
        window.history.pushState(null, "", "#home");
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Active section detection for landing page
      if (pathname === "/") {
        const sections = ["security", "for-clinics", "features", "how-it-works", "home"];
        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 140) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Support direct URL hash navigation and browser back/forward buttons
  useEffect(() => {
    if (pathname === "/" && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const targetEl = document.getElementById(id);
        if (targetEl) {
          const timeoutId = setTimeout(() => {
            targetEl.scrollIntoView({ behavior: "smooth" });
            setActiveSection(id);
          }, 100);
          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleHashOrPopState = () => {
      if (pathname === "/") {
        const hash = window.location.hash;
        if (hash) {
          const id = hash.replace("#", "");
          const targetEl = document.getElementById(id);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth" });
            setActiveSection(id);
          }
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setActiveSection("home");
        }
      }
    };

    window.addEventListener("hashchange", handleHashOrPopState);
    window.addEventListener("popstate", handleHashOrPopState);
    return () => {
      window.removeEventListener("hashchange", handleHashOrPopState);
      window.removeEventListener("popstate", handleHashOrPopState);
    };
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAdminRoute = pathname?.includes("admin");
  const canAccessAdminSidebar = user?.role !== "USER" && isAdminRoute;

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    id: string
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      scrollToSection(id);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 ${
        scrolled
          ? "shadow-sm py-2.5"
          : "shadow-xs py-3.5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo & Wordmark (Text-based, no QR code) */}
        <div className="flex items-center gap-3">
          {canAccessAdminSidebar && (
            <Button
              onClick={toggleSidebar}
              size="icon"
              variant="ghost"
              className="mr-1 h-9 w-9 text-slate-700 dark:text-slate-200"
              aria-label="Toggle Admin Sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                setActiveSection("home");
                if (window.location.hash) {
                  window.history.pushState(null, "", "/");
                }
              }
            }}
            className="flex items-center gap-2.5 text-slate-900 dark:text-white font-extrabold text-xl tracking-tight group focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
              <Activity className="h-5 w-5" />
            </div>
            <span className="leading-none">
              Medi<span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Scan</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links with Active State Indicator */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === "/" && activeSection === link.id;
            return (
              <Link
                key={link.title}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.id)}
                className={`relative rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "text-teal-700 dark:text-teal-300 font-semibold bg-teal-50/80 dark:bg-teal-950/60"
                    : "text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                {link.title}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Single Primary Auth Action Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user?.id ? (
            <>
              {user.role !== "SUPER_ADMIN" && <NotificationBell />}
              <UserButton />
            </>
          ) : (
            <LoginButton />
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === "/" && activeSection === link.id;
              return (
                <Link
                  key={link.title}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.href, link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                      : "text-slate-700 hover:bg-teal-50/50 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-900"
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>

          {/* Mobile user state actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {user?.id ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-xs text-slate-500">
                  Signed in as <strong>{user.name || user.phone}</strong>
                </div>

                {/* Patient-only items */}
                {user.role === "USER" && (
                  <Link
                    href="/history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-teal-700 bg-teal-50 dark:bg-teal-950 dark:text-teal-300"
                  >
                    <Layout className="h-4 w-4 text-teal-600" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* Super Admin-only items */}
                {user.role === "SUPER_ADMIN" && (
                  <Link
                    href="/admin/dashboard/organization"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-teal-700 bg-teal-50 dark:bg-teal-950 dark:text-teal-300"
                  >
                    <Layout className="h-4 w-4 text-teal-600" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut({ redirect: false });
                    router.replace("/");
                    router.refresh();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-1">
                <Button
                  asChild
                  className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/auth/login" prefetch={true} className="flex items-center justify-center">
                    <span>Sign In</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
