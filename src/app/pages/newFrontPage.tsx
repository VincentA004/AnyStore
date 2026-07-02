import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Inbox, MessageCircle, FileSearch, Lock } from 'lucide-react';
import { post } from 'aws-amplify/api';

const exampleQuestions = [
    'Find my apartment lease renewal',
    'Where is that Target receipt?',
    'When does my AirPods warranty expire?',
    'Show the screenshot with the blue sneakers',
    'What did I save about my car insurance?',
];

const features = [
    {
        icon: Inbox,
        title: 'Drop anything',
        subtitle: 'Receipts, screenshots, leases, warranties, notes — toss them all in one place. No folders required.',
    },
    {
        icon: MessageCircle,
        title: 'Ask like a person',
        subtitle: 'No keywords, no filters. Just ask the way you would ask a friend who never forgets.',
    },
    {
        icon: FileSearch,
        title: 'See where it came from',
        subtitle: 'Every answer shows you exactly which of your things it was found in, one tap from the original.',
    },
    {
        icon: Lock,
        title: 'Yours alone',
        subtitle: 'Your stuff stays private in your own space, ready whenever you come asking.',
    },
];

const FrontPage: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [emailBottom, setEmailBottom] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitErrorBottom, setSubmitErrorBottom] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitSuccessBottom, setSubmitSuccessBottom] = useState(false);

    const handleDemoRequest = async (e: React.FormEvent, emailNumber: number) => {
        e.preventDefault();
        const emailToCheck = emailNumber === 1 ? email : emailBottom;
        if (!emailToCheck) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToCheck)) {
            if (emailNumber === 1) {
                setSubmitError('Please enter a valid email address');
                setTimeout(() => setSubmitError(''), 2000);
            } else {
                setSubmitErrorBottom('Please enter a valid email address');
                setTimeout(() => setSubmitErrorBottom(''), 2000);
            }
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        setSubmitErrorBottom('');
        setSubmitSuccess(false);
        setSubmitSuccessBottom(false);

        try {
            const restOperation = post({
                apiName: 'S3_API',
                path: '/waitlist',
                options: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: {
                        email: emailToCheck
                    }
                }
            });

            await restOperation.response;
            if (emailNumber === 1) {
                setSubmitSuccess(true);
                setEmail('');
                setTimeout(() => setSubmitSuccess(false), 2000);
            } else {
                setSubmitSuccessBottom(true);
                setEmailBottom('');
                setTimeout(() => setSubmitSuccessBottom(false), 2000);
            }
        } catch (error) {
            console.error('Error submitting early access request:', error);
            if (emailNumber === 1) {
                setSubmitError('Failed to submit request. Please try again.');
                setTimeout(() => setSubmitError(''), 2000);
            } else {
                setSubmitErrorBottom('Failed to submit request. Please try again.');
                setTimeout(() => setSubmitErrorBottom(''), 2000);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white text-ink">
            {/* Top nav */}
            <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-hairline bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between px-6">
                    <span className="text-[22px] font-bold tracking-tight text-rausch select-none">
                        AnyStore
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            className="rounded-full px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-soft"
                            onClick={() => router.push('/signin')}
                        >
                            Log in
                        </button>
                        <button
                            className="rounded-full bg-rausch px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rausch-active"
                            onClick={() => router.push('/signin')}
                        >
                            Get started
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1120px] px-6 pt-20">
                {/* Hero */}
                <section className="flex flex-col items-center py-16 text-center">
                    <h1 className="max-w-2xl text-[28px] font-bold leading-snug md:text-4xl">
                        Drop anything. Find it later by asking.
                    </h1>
                    <p className="mt-4 max-w-xl text-base text-muted-ink md:text-lg">
                        AnyStore is the junk drawer that answers back. Toss in receipts,
                        screenshots, leases, and notes — then just ask for them like you
                        would ask a person.
                    </p>

                    {/* Email capture pill */}
                    <form
                        onSubmit={(e) => handleDemoRequest(e, 1)}
                        className="mt-8 flex h-16 w-full max-w-xl items-center rounded-full border border-hairline bg-white pl-6 pr-2 shadow-float"
                    >
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-full flex-1 bg-transparent text-base text-ink placeholder:text-muted-ink outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex h-12 shrink-0 items-center gap-2 rounded-full bg-rausch px-6 text-sm font-medium text-white transition-colors hover:bg-rausch-active ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            {isSubmitting ? 'Sending...' : 'Get early access'}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                    <div className="flex h-8 items-center justify-center">
                        {submitError && <p className="mt-2 text-sm text-[#c13515]">{submitError}</p>}
                        {submitSuccess && <p className="mt-2 text-sm text-green-700">You&apos;re on the list — we&apos;ll be in touch soon.</p>}
                    </div>

                    {/* Example questions */}
                    <div className="mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2">
                        {exampleQuestions.map((question) => (
                            <span
                                key={question}
                                className="rounded-full border border-hairline bg-white px-4 py-2 text-sm text-muted-ink"
                            >
                                &ldquo;{question}&rdquo;
                            </span>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="border-t border-hairline-soft py-16">
                    <h2 className="text-center text-[21px] font-bold">
                        A home for the stuff that never had one
                    </h2>
                    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-card border border-hairline bg-white p-6 transition-shadow hover:shadow-float"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft">
                                    <feature.icon className="h-5 w-5 text-rausch" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-ink">{feature.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-ink">{feature.subtitle}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="border-t border-hairline-soft py-16">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div>
                            <span className="text-sm font-semibold text-rausch">1. Drop</span>
                            <h3 className="mt-2 text-[20px] font-semibold text-ink">Toss it in as-is</h3>
                            <p className="mt-2 text-base text-muted-ink">
                                Drag in whatever&apos;s cluttering your downloads, camera roll, or
                                inbox. No sorting, no naming, no folders.
                            </p>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-rausch">2. Forget</span>
                            <h3 className="mt-2 text-[20px] font-semibold text-ink">We keep it tidy</h3>
                            <p className="mt-2 text-base text-muted-ink">
                                Everything you save gets read, tagged, and summarized quietly in
                                the background so it&apos;s findable later.
                            </p>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-rausch">3. Ask</span>
                            <h3 className="mt-2 text-[20px] font-semibold text-ink">Just say what you need</h3>
                            <p className="mt-2 text-base text-muted-ink">
                                &ldquo;Find my lease.&rdquo; &ldquo;What warranty expires soon?&rdquo;
                                You get the answer plus the exact thing it was found in.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="flex flex-col items-center border-t border-hairline-soft py-16 text-center">
                    <h2 className="max-w-lg text-[28px] font-bold leading-snug">
                        Your stuff, one question away
                    </h2>
                    <p className="mt-3 text-base text-muted-ink">Get early access today.</p>
                    <form
                        onSubmit={(e) => handleDemoRequest(e, 2)}
                        className="mt-8 flex h-16 w-full max-w-xl items-center rounded-full border border-hairline bg-white pl-6 pr-2 shadow-float"
                    >
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={emailBottom}
                            onChange={(e) => setEmailBottom(e.target.value)}
                            className="h-full flex-1 bg-transparent text-base text-ink placeholder:text-muted-ink outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex h-12 shrink-0 items-center gap-2 rounded-full bg-rausch px-6 text-sm font-medium text-white transition-colors hover:bg-rausch-active ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            {isSubmitting ? 'Sending...' : 'Get early access'}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                    <div className="flex h-8 items-center justify-center">
                        {submitErrorBottom && <p className="mt-2 text-sm text-[#c13515]">{submitErrorBottom}</p>}
                        {submitSuccessBottom && <p className="mt-2 text-sm text-green-700">You&apos;re on the list — we&apos;ll be in touch soon.</p>}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-hairline bg-white">
                <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
                    <span className="text-base font-bold tracking-tight text-rausch select-none">AnyStore</span>
                    <div className="flex items-center gap-6 text-sm text-muted-ink">
                        <span>© 2026 AnyStore. All rights reserved.</span>
                        <span className="cursor-pointer hover:text-ink">Privacy</span>
                        <span className="cursor-pointer hover:text-ink">Terms</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FrontPage;
