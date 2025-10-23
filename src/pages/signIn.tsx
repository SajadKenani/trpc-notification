import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import styles from "./Navigation.module.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const signIn = trpc.account.signIn.useMutation({
    onSuccess: (data) => {
      setMessage(`Welcome back, ${data.user.name}!`);
      localStorage.setItem("@user_id", data.user.id);
      console.log("Habibi wallah ✅", data);
    },
    onError: (error) => {
      setMessage(error.message || "Something went wrong!");
      console.error(error);
    },
  });
const handleSignIn = (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) {
    setMessage("Email and password are required!");
    return;
  }

  signIn.mutate(
    { email, password },
    {
      onSuccess: () => {
        window.location.href = "/"; 
        window.location.reload();    
      },
      onError: (err) => {
        setMessage(err.message || "Sign in failed");
      },
    }
  );
};

  return (
    <div className={styles.signUpContainer}>
      <form onSubmit={handleSignIn} className={styles.signUpForm}>
        <h2 className={styles.signUpTitle}>Sign In</h2>

        <label className={styles.inputLabel}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={styles.inputField}
        />

        <label className={styles.inputLabel}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={styles.inputField}
        />

        <button type="submit" className={styles.signUpButton}>
          Sign In
        </button>

        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default SignIn;
