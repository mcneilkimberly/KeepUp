import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordsMatch =
        confirmPassword.length === 0 || password === confirmPassword;

    const passwordStrength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (password.length === 0) return "Enter a password";
        if (score <= 2) return "Weak";
        if (score <= 4) return "Good";
        return "Strong";
    }, [password]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (!passwordsMatch) {
        alert("Passwords do not match.");
        return;
        }

        // Front-end only for now.
        console.log("Sign up form submitted:", {
        name,
        email,
        password,
        confirmPassword,
        });
    }

    return (
        <section className="authPage authPageSignup">
        <div className="authShell">
            <div className="authCard">
            <div className="authVisual" aria-hidden="true">
                <div className="authVisualOverlay" />
                <div className="authVisualContent">
                <div className="authBadge">KeepUp</div>
                <h1 className="authVisualTitle">Stay on top of your business finances.</h1>
                <p className="authVisualText">
                    Organize your records, keep your books cleaner, and make tax
                    season feel a lot less chaotic.
                </p>

                <div className="authStat authStatTop">
                    <span className="authStatLabel">Monthly Revenue</span>
                    <strong>$24,810</strong>
                </div>

                <div className="authStat authStatBottom">
                    <span className="authStatLabel">Expenses Tracked</span>
                    <strong>128 entries</strong>
                </div>

                <div className="authMiniCard authMiniCardOne">Invoices</div>
                <div className="authMiniCard authMiniCardTwo">Reports</div>
                <div className="authMiniCard authMiniCardThree">Tax Planner</div>
                </div>
            </div>

            <div className="authFormSide">
                <div className="authFormTop">
                <div className="authEyebrow">Create your account</div>
                <h2 className="authTitle">Sign Up</h2>
                <p className="authSubtitle">
                    Get started with KeepUp and build your workspace.
                </p>
                </div>

                <form className="authForm" onSubmit={handleSubmit}>
                <div className="authField">
                    <label htmlFor="signup-name" className="authLabel">
                    Name
                    </label>
                    <input
                    id="signup-name"
                    className="authInput"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                    />
                </div>

                <div className="authField">
                    <label htmlFor="signup-email" className="authLabel">
                    Email
                    </label>
                    <input
                    id="signup-email"
                    className="authInput"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    />
                </div>

                <div className="authField">
                    <div className="authLabelRow">
                    <label htmlFor="signup-password" className="authLabel">
                        Password
                    </label>
                    <button
                        type="button"
                        className="authInlineAction"
                        onClick={() => setShowPassword((v) => !v)}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                    </div>
                    <input
                    id="signup-password"
                    className="authInput"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    />
                    <div className="authHelperRow">
                    <span className="authHelperText">
                        Use 8+ characters with a mix of letters, numbers, or symbols.
                    </span>
                    <span className="authStrength">{passwordStrength}</span>
                    </div>
                </div>

                <div className="authField">
                    <div className="authLabelRow">
                    <label htmlFor="signup-confirm-password" className="authLabel">
                        Confirm Password
                    </label>
                    <button
                        type="button"
                        className="authInlineAction"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                    >
                        {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                    </div>
                    <input
                    id="signup-confirm-password"
                    className={`authInput ${!passwordsMatch ? "authInputError" : ""}`}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    />
                    {!passwordsMatch && (
                    <div className="authErrorText">Passwords do not match.</div>
                    )}
                </div>

                <button className="authSubmitBtn" type="submit">
                    Create Account
                </button>

                <p className="authTerms">
                    By signing up, you agree to our{" "}
                    <a
                    href="https://placehold.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    Terms
                    </a>{" "}
                    and{" "}
                    <a
                    href="https://placehold.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    Privacy Policy
                    </a>
                    .
                </p>

                <div className="authSwitchText">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
                </form>

                <div className="authBottomLinks">
                <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer">
                    About
                </a>
                <span>•</span>
                <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer">
                    Contact
                </a>
                <span>•</span>
                <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer">
                    Privacy
                </a>
                <span>•</span>
                <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer">
                    Terms
                </a>
                <span>•</span>
                <span>© KeepUp, Inc. 2026</span>
                </div>
            </div>
            </div>
        </div>
        </section>
    );
}