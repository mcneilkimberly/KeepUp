import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuth } from "../auth";

type TouchedState = {
    emailOrUsername: boolean;
    password: boolean;
};

function EyeIcon({ open }: { open: boolean }) {
    if (open) {
        return (
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="authEyeIcon"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="authEyeIcon"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            >
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
                <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.13 2.8" />
                <path d="M6.61 6.61A17.32 17.32 0 0 0 2 12s3.5 7 10 7a10.9 10.9 0 0 0 5.39-1.39" />
        </svg>
    );
}

export default function Login() {
    const navigate = useNavigate();

    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [touched, setTouched] = useState<TouchedState>({
        emailOrUsername: false,
        password: false,
    });

    const errors = useMemo(() => {
        const result = {
        emailOrUsername: "",
        password: "",
        };

        const trimmedValue = emailOrUsername.trim();

        if (trimmedValue.length === 0) {
        result.emailOrUsername = "Enter your email or username.";
        } 

        if (password.length === 0) {
        result.password = "Enter your password.";
        } 

        return result;
    }, [emailOrUsername, password]);

    const formIsValid = !errors.emailOrUsername && !errors.password;

    function markTouched(field: keyof TouchedState) {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }

    const [serverError, setServerError] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setServerError("");


        setTouched({
        emailOrUsername: true,
        password: true,
        });

        if (!formIsValid) {
        return;
        }

        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailOrUsername: emailOrUsername.trim(),
                    password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                saveAuth(data.token, data.user);
                console.log("Login Successful");
                navigate("/");
            } else {
                const data = await response.json();
                console.error("Login Failed:", data.error);
                setServerError(data.error);
            }
        } catch (error) {
            console.error("An error occurred during login:", error);
        }
    }

    return (
        <section className="authPage authPageLogin">
        <div className="authBackdrop" aria-hidden="true">
            <div className="authGlow authGlowOne" />
            <div className="authGlow authGlowTwo" />
            <div className="authGlow authGlowThree" />
            <div className="authChart authChartOne" />
            <div className="authChart authChartTwo" />
        </div>

        <div className="authCenteredShell">
            <div className="authCenteredCard">
            <div className="authCardInner">
                <div className="authBrandBlock">
                <div className="authTitle">
                    <b>KeepUp</b>
                </div>
                <p className="authSubtitle">
                    <i>Welcome back! — Stay on top of your business finances</i>.
                </p>
                </div>

                <div className="authTopDivider" />

                <p className="authSectionTitle">
                <b>
                    <u>Login</u>
                </b>
                </p>

                {serverError && (
                    <div className="authErrorText" style={{ textAlign: "center", marginBottom: "1rem" }}>{serverError}
                    </div>
                )}

                <form className="authForm" onSubmit={handleSubmit} noValidate>
                <div className="authField">
                    <label htmlFor="login-email-username" className="authLabel">
                    Email/Username
                    </label>
                    <input
                    id="login-email-username"
                    className={`authInput ${
                        touched.emailOrUsername && errors.emailOrUsername
                        ? "authInputError"
                        : ""
                    }`}
                    type="text"
                    placeholder="Enter your email or username"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    onBlur={() => markTouched("emailOrUsername")}
                    autoComplete="username"
                    />
                    {/* <div className="authHelperText">
                        <i>Use either the email address or username tied to your account</i>.
                    </div> */}
                    {touched.emailOrUsername && errors.emailOrUsername && (
                    <div className="authErrorText">{errors.emailOrUsername}</div>
                    )}
                </div>

                <div className="authField">
                    <div className="authLabelRow">
                    <label htmlFor="login-password" className="authLabel">
                        Password
                    </label>
                    <button
                        type="button"
                        className="authIconButton"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        <EyeIcon open={showPassword} />
                    </button>
                    </div>

                    <input
                    id="login-password"
                    className={`authInput ${
                        touched.password && errors.password ? "authInputError" : ""
                    }`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched("password")}
                    autoComplete="current-password"
                    />

                    {/* <div className="authHelperText">
                    Enter the password associated with your KeepUp account.
                    </div> */}

                    {touched.password && errors.password && (
                    <div className="authErrorText">{errors.password}</div>
                    )}
                </div>

                <button className="authSubmitBtn" type="submit" disabled={!formIsValid}>
                    Log In
                </button>

                <p className="authTerms">
                    By logging in, you agree to our{" "}
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
                    Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
                </div>
                </form>

                <div className="authBottomLinks">
                <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer">
                    <b>About</b>
                </a>
                <span>•</span>
                <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer">
                    <b>Contact</b>
                </a>
                <span>•</span>
                <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer">
                    <b>Privacy</b>
                </a>
                <span>•</span>
                <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer">
                    <b>Terms</b>
                </a>
                <span>•</span>
                <span><b>© <i>KeepUp</i>, Inc. 2026</b></span>
                </div>
            </div>
            </div>
        </div>
        </section>
    );
}