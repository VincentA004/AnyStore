"use client";
import { useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import GeneralDashboard from "../pages/Dashboard";
import { CircularProgress } from "@mui/material";
import { isDemoBypassEnabled } from "@/lib/demoMode";

export default function Dashboard() {
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  const router = useRouter();
  const demoMode = isDemoBypassEnabled();

  useEffect(() => {
    if (demoMode) return;

    if (authStatus === 'unauthenticated') {
      router.replace('/signin');
    }
    
    if (!user && authStatus === 'authenticated') {
      window.location.reload();
      return;
    }
  }, [authStatus, router, user]);

  if (demoMode) {
    return <GeneralDashboard />;
  }

  if (authStatus === 'configuring') {
    return (
      <div className="grid h-screen place-items-center">
        <CircularProgress value={0.5} />
      </div>
    );
  }

  if (!user || authStatus !== 'authenticated') {
    return null;
  }

  return <GeneralDashboard />;
}
