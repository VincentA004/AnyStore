"use client";
import { FormEvent, useState, useEffect } from "react";
import { signIn, signUp, confirmSignUp, resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { useRouter } from 'next/navigation';
import { CircularProgress } from "@mui/material";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { ArrowLeft } from 'lucide-react';

const inputClassName =
  "mt-1 block w-full h-14 rounded-lg border border-hairline bg-white px-3 text-base text-ink placeholder:text-muted-ink focus:border-ink focus:border-2 focus:outline-none";

const labelClassName = "block text-sm font-medium text-muted-ink";

type AuthMode = 'signIn' | 'signUp' | 'verify' | 'forgotPassword' | 'resetPassword';

interface AuthFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  confirmPassword?: HTMLInputElement;
  code?: HTMLInputElement;
  firstName?: HTMLInputElement;
  lastName?: HTMLInputElement;
}

interface AuthForm extends HTMLFormElement {
  readonly elements: AuthFormElements;
}

export default function SignInDetails() {
  const router = useRouter();
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (authStatus === "configuring") return;

    if (authStatus === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [authStatus, router, user]);

  if (authStatus === 'configuring') {
    return (
      <div className="grid h-screen place-items-center bg-white">
        <CircularProgress />
      </div>
    );
  }

  async function handleSignIn(form: AuthForm) {
    try {
      setLoading(true);
      setError("");

      await signIn({
        username: form.elements.email.value,
        password: form.elements.password.value,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(form: AuthForm) {
    try {
      setLoading(true);
      setError("");
      const password = form.elements.password.value;
      const username = form.elements.email.value;

      const { isSignUpComplete } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            given_name: form.elements.firstName?.value || '',
            family_name: form.elements.lastName?.value || '',
            email: username,
          },
        },
      });

      if (!isSignUpComplete) {
        setEmail(username);
        setMode('verify');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(form: AuthForm) {
    try {
      setLoading(true);
      setError("");

      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: form.elements.code?.value || '',
      });

      if (isSignUpComplete) {
        // Auto sign-in after successful verification
        try {
          await signIn({
            username: email,
            password: form.elements.password?.value || '',
          });
        } catch (signInErr) {
          setMode('signIn');
          setError("✓ Verification successful. Please sign in with your credentials.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during verification");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(form: AuthForm) {
    try {
      setLoading(true);
      setError("");

      await resetPassword({
        username: form.elements.email.value,
      });
      setEmail(form.elements.email.value);
      setMode('resetPassword');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while requesting password reset");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(form: AuthForm) {
    try {
      setLoading(true);
      setError("");
      const newPassword = form.elements.password.value;

      await confirmResetPassword({
        username: email,
        confirmationCode: form.elements.code?.value || '',
        newPassword,
      });

      // Auto sign-in after successful password reset
      try {
        await signIn({
          username: email,
          password: newPassword,
        });
      } catch (signInErr) {
        setMode('signIn');
        setError("Password reset successful. Please sign in with your new password.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while resetting password");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<AuthForm>) {
    event.preventDefault();
    const form = event.currentTarget;

    switch (mode) {
      case 'signIn':
        await handleSignIn(form);
        break;
      case 'signUp':
        await handleSignUp(form);
        break;
      case 'verify':
        await handleVerify(form);
        break;
      case 'forgotPassword':
        await handleForgotPassword(form);
        break;
      case 'resetPassword':
        await handleResetPassword(form);
        break;
    }
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </button>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8 rounded-card border border-hairline bg-white p-8 shadow-float">
          <div className="space-y-3 text-center">
            <span className="text-[22px] font-bold tracking-tight text-rausch select-none">
              AnyStore
            </span>
            <h2 className="text-[22px] font-semibold leading-snug text-ink">
              {mode === 'signIn' && 'Welcome back'}
              {mode === 'signUp' && 'Make your AnyStore'}
              {mode === 'verify' && 'Check your email'}
              {mode === 'forgotPassword' && 'Reset your password'}
              {mode === 'resetPassword' && 'Pick a new password'}
            </h2>
            {mode === 'signIn' && (
              <p className="text-sm text-muted-ink">
                Everything you dropped in is right where you left it.
              </p>
            )}
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {(mode === 'signIn' || mode === 'signUp' || mode === 'forgotPassword') && (
                <div>
                  <label htmlFor="email" className={labelClassName}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={inputClassName}
                  />
                </div>
              )}

              {mode === 'signUp' && (
                <>
                  <div>
                    <label htmlFor="firstName" className={labelClassName}>
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClassName}>
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className={inputClassName}
                    />
                  </div>
                </>
              )}

              {(mode === 'verify' || mode === 'resetPassword') && (
                <div>
                  <label htmlFor="code" className={labelClassName}>
                    Verification code
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    className={inputClassName}
                  />
                </div>
              )}

              {(mode === 'signIn' || mode === 'signUp' || mode === 'resetPassword') && (
                <div>
                  <label htmlFor="password" className={labelClassName}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'signIn' ? "current-password" : "new-password"}
                    required
                    className={inputClassName}
                  />
                </div>
              )}

              {mode === 'signUp' && (
                <div>
                  <label htmlFor="confirmPassword" className={labelClassName}>
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={inputClassName}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className={`rounded-lg border p-4 ${error.startsWith('✓') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className={`text-sm ${error.startsWith('✓') ? 'text-green-700' : 'text-[#c13515]'}`}>{error}</div>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-rausch text-base font-medium text-white transition-colors hover:bg-rausch-active active:bg-rausch-active disabled:bg-rausch-disabled"
              >
                {loading ? "One sec..." : (
                  mode === 'signIn' ? "Sign in" :
                    mode === 'signUp' ? "Sign up" :
                      mode === 'verify' ? "Verify email" :
                        mode === 'forgotPassword' ? "Send reset link" :
                          "Reset password"
                )}
              </button>

              {mode === 'signIn' && (
                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setMode('signUp')}
                    className="font-medium text-ink underline-offset-4 hover:underline"
                  >
                    Create an account
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('forgotPassword')}
                    className="text-muted-ink underline-offset-4 hover:text-ink hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {(mode === 'signUp' || mode === 'forgotPassword' || mode === 'resetPassword' || mode === 'verify') && (
                <button
                  type="button"
                  onClick={() => setMode('signIn')}
                  className="text-sm text-muted-ink underline-offset-4 hover:text-ink hover:underline"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
