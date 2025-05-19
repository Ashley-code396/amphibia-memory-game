import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import styles from "./AuthForm.module.css";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created!");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer} noValidate>
      <h2 className={styles.title}>{isLogin ? "Login" : "Sign Up"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className={styles.inputField}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className={styles.inputField}
      />
      <button type="submit" className={styles.primaryButton}>
        {isLogin ? "Login" : "Sign Up"}
      </button>
      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className={styles.secondaryButton}
      >
        {isLogin ? "Switch to Sign Up" : "Switch to Login"}
      </button>
    </form>
  );
}
