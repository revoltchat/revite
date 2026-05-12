import { useState } from "preact/hooks";
import styles from "./Landing.module.scss";

const API = import.meta.env.VITE_API_URL as string;

export default function Landing() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const submit = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch(`${API}/waitlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
        } catch {}
        setDone(true);
        setLoading(false);
    };

    return (
        <div className={styles.landing}>
            <nav className={styles.nav}>
                <img src="/assets/apricotter-wordmark.webp" alt="Apricotter" />
                <a href="/login">Sign in</a>
            </nav>
            <main className={styles.main}>
                <div className={styles.card}>
                    {done ? (
                        <div className={styles.success}>
                            <div className={styles.title}>You're on the list.</div>
                            <div className={styles.subtitle}>
                                We'll reach out when your spot is ready.
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.headline}>
                                <h1>A private space for your readers.</h1>
                                <p>
                                    Apricotter gives authors a smart, intimate channel to connect
                                    with their audience — built around your books, your voice, and
                                    your community.
                                </p>
                            </div>
                            <form onSubmit={submit}>
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    value={email}
                                    onInput={(e) =>
                                        setEmail((e.target as HTMLInputElement).value)
                                    }
                                />
                                <button type="submit" disabled={loading}>
                                    {loading ? "Saving…" : "Get early access"}
                                </button>
                            </form>
                            <span className={styles.hint}>
                                {"By invite only. "}
                                <a href="/login/create">Have a code?</a>
                            </span>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
