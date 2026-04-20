import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

type TouchedState = {
    username: boolean;
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
};

const USERNAME_MIN = 5;
const USERNAME_MAX = 25;

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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value.trim());
}

function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[!@#$%^&*()\-_+=~<>?,./\\[\]{}]/.test(password),
  };
}

export default function SignUp() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState<TouchedState>({
    username: false,
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);

  const passedPasswordChecks = Object.values(passwordChecks).filter(Boolean).length;

  const passwordStrength = useMemo(() => {
    if (password.length === 0) {
      return { label: "Enter a password", level: 0 };
    }

    if (passedPasswordChecks <= 2) {
      return { label: "Weak", level: 1 };
    }

    if (passedPasswordChecks <= 4) {
      return { label: "Good", level: 2 };
    }

    return { label: "Strong", level: 3 };
  }, [password.length, passedPasswordChecks]);

  const errors = useMemo(() => {
    const result = {
        username: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    };

    const trimmedUsername = username.trim();

    if (trimmedUsername.length === 0) {
        result.username = "Enter a username.";
    } else if (
        trimmedUsername.length < USERNAME_MIN ||
        trimmedUsername.length > USERNAME_MAX
    ) {
        result.username = "Username must be 5–25 characters.";
    }

    if (name.trim().length === 0) {
        result.name = "Please enter your name.";
    }

    if (email.trim().length === 0) {
      result.email = "Please enter your email.";
    } else if (!isValidEmail(email)) {
      result.email = "Enter a valid email like name@company.com.";
    }

    if (password.length === 0) {
      result.password = "Please create a password.";
    } else if (!Object.values(passwordChecks).every(Boolean)) {
      result.password =
        "Password must be 8+ characters and include uppercase, lowercase, a number, and a special character.";
    }

    if (confirmPassword.length === 0) {
      result.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      result.confirmPassword = "Passwords do not match.";
    }

    return result;
  }, [username, name, email, password, confirmPassword, passwordChecks]);

  const formIsValid =
    !errors.username &&
    !errors.name &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  function markTouched(field: keyof TouchedState) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setTouched({
        username: true,
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
});

    if (!formIsValid) {
      return;
    }

    console.log("Sign up form submitted:", {
      username,
      name,
      email,
      password,
      confirmPassword,
    });
  }

  return (
    <section className="authPage authPageSignup">
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
              <div className="authTitle"><b>KeepUp</b></div>
              <p className="authSubtitle"><i>Stay on top of your business finances</i>.</p>
            </div>

            <div className="authTopDivider"/>

            <p className="authSectionTitle"><b><u>Sign Up</u></b></p>

            <form className="authForm" onSubmit={handleSubmit} noValidate>
              <div className="authField">
            <label htmlFor="signup-username" className="authLabel">
                Username
            </label>
            <input
                id="signup-username"
                className={`authInput ${touched.username && errors.username ? "authInputError" : ""}`}
                type="text"
                placeholder="Enter a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => markTouched("username")}
                autoComplete="username"
                maxLength={USERNAME_MAX}
            />

            <div className="authFieldMeta">
            <span className="authHelperText">5–25 characters.</span>
            <span
                className={`authCharCount ${
                username.trim().length > 0 && username.trim().length < USERNAME_MIN
                    ? "authCharCountWarning"
                    : ""
                }`}
            >
                {username.length}/{USERNAME_MAX}
            </span>
            </div>

            {touched.username && errors.username && (
                <div className="authErrorText">{errors.username}</div>
            )}
            </div>

            <div className="authField">
                <label htmlFor="signup-name" className="authLabel">
                    Name
                </label>
                <input
                    id="signup-name"
                    className={`authInput ${touched.name && errors.name ? "authInputError" : ""}`}
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched("name")}
                    autoComplete="name"
                />
                {touched.name && errors.name && (
                    <div className="authErrorText">{errors.name}</div>
                )}
            </div>

              <div className="authField">
                <label htmlFor="signup-email" className="authLabel">
                  Email
                </label>
                <input
                  id="signup-email"
                  className={`authInput ${touched.email && errors.email ? "authInputError" : ""}`}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched("email")}
                  autoComplete="email"
                />
                {touched.email && errors.email && (
                  <div className="authErrorText">{errors.email}</div>
                )}
              </div>

              <div className="authField">
                <div className="authLabelRow">
                  <label htmlFor="signup-password" className="authLabel">
                    Password
                  </label>
                  <button
                    type="button"
                    className="authIconButton"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                <input
                  id="signup-password"
                  className={`authInput ${touched.password && errors.password ? "authInputError" : ""}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => markTouched("password")}
                  autoComplete="new-password"
                />

                <div className="authStrengthWrap">
                  <div className="authStrengthBar">
                    <div
                      className={`authStrengthFill authStrengthFillLevel${passwordStrength.level}`}
                    />
                  </div>
                  <span
                    className={`authStrengthText authStrengthTextLevel${passwordStrength.level}`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>

                <div className="authHelperText">
                  Use 8+ characters with uppercase, lowercase, a number, and a special character.
                </div>

                {touched.password && errors.password && (
                  <div className="authErrorText">{errors.password}</div>
                )}
              </div>

              <div className="authField">
                <label htmlFor="signup-confirm-password" className="authLabel">
                  Confirm Password
                </label>
                <input
                  id="signup-confirm-password"
                  className={`authInput ${touched.confirmPassword && errors.confirmPassword ? "authInputError" : ""}`}
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => markTouched("confirmPassword")}
                  autoComplete="new-password"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="authErrorText">{errors.confirmPassword}</div>
                )}
              </div>

              <button
                className="authSubmitBtn"
                type="submit"
                disabled={!formIsValid}
              >
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