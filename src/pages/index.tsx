// components/Navigation.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";

function Navigation() {
  const pathname = usePathname();
  
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/signIn", label: "Sign In" },
    { href: "/signUp", label: "Sign Up" },
    { href: "/notifications", label: "Notifications" },
    // { href: "/register", label: "Register" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>M</div>
            <span className={styles.logoText}>MyApp</span>
          </Link>

          <div className={styles.navLinks}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}


export default function Home() {
  return (
    <div className={styles.pageContainer}>
      <Navigation />
      
      {/* <div className={styles.content}> */}
        {/* <div className={styles.hero}>
          <h2 className={styles.heroTitle}>Welcome to MyApp</h2>
          <p className={styles.heroSubtitle}>
            Experience the future of digital innovation. Explore our features and join thousands of satisfied users.
          </p>
        </div> */}

        {/* <div className={styles.featureGrid}>
          <div className={`${styles.featureCard} ${styles.blue}`}>
            <div className={styles.featureIcon}>🚀</div>
            <h3 className={styles.featureTitle}>Fast & Reliable</h3>
            <p className={styles.featureDesc}>Lightning-fast performance with 99.9% uptime guaranteed.</p>
          </div>

          <div className={`${styles.featureCard} ${styles.purple}`}>
            <div className={styles.featureIcon}>🔒</div>
            <h3 className={styles.featureTitle}>Secure</h3>
            <p className={styles.featureDesc}>Bank-level encryption to keep your data safe and private.</p>
          </div>

          <div className={`${styles.featureCard} ${styles.pink}`}>
            <div className={styles.featureIcon}>💎</div>
            <h3 className={styles.featureTitle}>Premium Quality</h3>
            <p className={styles.featureDesc}>Top-tier features designed for the best user experience.</p>
          </div>
        </div> */}

        {/* <div className={styles.ctaSection}>
          <Link href="/signUp" className={styles.ctaButton}>
            Get Started Today
          </Link>
        </div> */}
      {/* </div> */}
    </div>
  );
}
