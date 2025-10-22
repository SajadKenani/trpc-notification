import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import styles from "./Navigation.module.css";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const signUp = trpc.account.signUp.useMutation({
    onSuccess: (data) => {
      setMessage(`Welcome, ${data.name}! Account created successfully 🎉`);
      localStorage.setItem("@user_id", data.id)
    },
    onError: (error) => {
      setMessage(error.message);
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) {
    setMessage("Email and password are required!");
    return;
  }

  signUp.mutate(
    { name, email, password },
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
      <h2 className={styles.signUpTitle}>Sign Up</h2>
      <form onSubmit={handleSubmit} className={styles.signUpForm}>
        <label className={styles.inputLabel}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.inputField}
        />

        <label className={styles.inputLabel}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.inputField}
        />

        <label className={styles.inputLabel}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.inputField}
        />

        <button type="submit" className={styles.signUpButton}>
          Sign Up
        </button>
      </form>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default SignUp;
