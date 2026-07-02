"use client";
import {
    Search,
    Plus,
    Inbox,
    Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, FetchUserAttributesOutput } from 'aws-amplify/auth';
import { CircularProgress } from "@mui/material";
import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DataRoomCard from "@/components/tabs/misc/DataRoomCard";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { post, get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { demoDatarooms, demoUser, demoUserAttributes, isDemoBypassEnabled } from "@/lib/demoMode";
import { anystoreBackend, isAnystoreBackendConfigured } from "@/lib/anystoreBackend";


type DataRoom = {
    id: string | null | undefined;
    title: string;
    lastOpened: string;
    bucketName: string;
    uuid: string;
    permissionLevel: string;
    sharedBy?: string;
    addedAt: string;
    users?: sharedUser[];
    status?: string; // Add status field
};

type InvitedRoom = {
    bucketName: string;
    uuid: string;
    permissionLevel: string;
    sharedBy: string;
    sharedAt: string;
};

interface sharedUser {
    email: string;
    name: string;
    role: string;
}

const SkeletonCard = () => (
    <div className="w-full h-[150px] bg-surface-soft rounded-card animate-pulse">
        <div className="p-6 space-y-3">
            <div className="h-5 bg-surface-strong rounded w-3/4"></div>
            <div className="h-4 bg-surface-strong rounded w-1/2"></div>
        </div>
    </div>
);

const SkeletonInvite = () => (
    <div className="bg-white rounded-card border border-hairline p-4 mb-3 animate-pulse w-full">
        <div className="space-y-2">
            <div className="h-4 bg-surface-strong rounded w-3/4"></div>
            <div className="h-3 bg-surface-strong rounded w-1/2"></div>
        </div>
    </div>
);

export default function GeneralDashboard() {
    const router = useRouter();
    const { user, signOut } = useAuthenticator((context) => [context.user]);
    const demoMode = isDemoBypassEnabled();
    const activeUser = demoMode ? demoUser : user;
    const [userAttributes, setUserAttributes] = useState<FetchUserAttributesOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [invitedDatarooms, setInvitedDatarooms] = useState<any[]>([]);
    const [isInvitesLoading, setIsInvitesLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
    const [confirmationName, setConfirmationName] = useState('');
    const [pendingAcceptBucketId, setPendingAcceptBucketId] = useState<string | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const [dataRooms, setDataRooms] = useState<DataRoom[]>([]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newDataroomName, setNewDataroomName] = useState('');
    const [familyName, setFamilyName] = useState('');
    const [givenName, setGivenName] = useState('');

    // Add useEffect to monitor dataRooms changes
    useEffect(() => {
        console.log("dataRooms updated:", dataRooms);
    }, [dataRooms]);

    const handleDataRoomClick = (id: string | null | undefined) => {
        router.push(`/dataroom/${id}/home`);
    };

    const handleAddDataroom = async () => {
        if (isCreating) return;
        if (dataRooms.length >= 8) {
            alert("You have reached the maximum limit of 8 spaces");
            return;
        }

        const newDataroomNameExist = newDataroomName.trim();
        if (newDataroomNameExist) {
            setIsCreating(true);
            try {
                if (isAnystoreBackendConfigured) {
                    const workspace = await anystoreBackend.createWorkspace(newDataroomNameExist);
                    const newDataroom: DataRoom = {
                        bucketName: workspace.name,
                        uuid: workspace.id,
                        permissionLevel: 'OWNER',
                        addedAt: workspace.created_at || new Date().toISOString(),
                        sharedBy: activeUser.username,
                        id: workspace.id,
                        title: workspace.name,
                        lastOpened: 'Never opened',
                        status: 'READY'
                    };

                    setDataRooms([...dataRooms, newDataroom]);
                    setIsAddDialogOpen(false);
                    setNewDataroomName('');
                    return;
                }

                const restOperation = post({
                    apiName: 'S3_API',
                    path: '/create-data-room',
                    options: {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: {
                            bucketName: newDataroomNameExist
                        },
                        withCredentials: true
                    }
                });

                const { body } = await restOperation.response;
                const responseText = await body.text();
                const response = JSON.parse(responseText);

                console.log("response for space creation", response);

                const newDataroom: DataRoom = {
                    bucketName: newDataroomNameExist,
                    uuid: response.uuid,
                    permissionLevel: 'OWNER',
                    addedAt: new Date().toISOString(),
                    sharedBy: activeUser.username,
                    id: response.uuid,
                    title: response.bucketName,
                    lastOpened: 'Never Opened',
                    status: response.status // Add status from response
                };

                setDataRooms([...dataRooms, newDataroom]);
                setIsAddDialogOpen(false);
                setNewDataroomName('');
            } catch (error) {
                console.error('Error creating space:', error);
            } finally {
                setIsCreating(false);
            }
        }
    };

    const handleFetchDataRooms = async () => {
        setIsLoading(true);
        if (demoMode) {
            setDataRooms(demoDatarooms as DataRoom[]);
            setInvitedDatarooms([]);
            setIsLoading(false);
            setIsInvitesLoading(false);
            return;
        }

        try {
            if (isAnystoreBackendConfigured) {
                const workspaces = await anystoreBackend.getWorkspaces();
                const newDataRooms = workspaces.map((workspace) => ({
                    id: workspace.id,
                    title: workspace.name,
                    bucketName: workspace.name,
                    uuid: workspace.id,
                    addedAt: workspace.created_at || new Date().toISOString(),
                    lastOpened: workspace.created_at
                        ? new Date(workspace.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                        })
                        : 'Just now',
                    permissionLevel: 'OWNER',
                    sharedBy: userAttributes?.email || demoUserAttributes.email,
                    users: [],
                    status: 'READY'
                }));

                setDataRooms(newDataRooms);
                setInvitedDatarooms([]);
                return;
            }

            const { credentials } = await fetchAuthSession();
            if (!credentials) {
                throw new Error('User is not authenticated');
            }

            const restOperation = get({
                apiName: 'S3_API',
                path: '/get-data-rooms',
                options: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            });

            const { body } = await restOperation.response;
            const responseText = await body.text();
            const response = JSON.parse(responseText);

            console.log("spaces fetched", response);

            // Update data rooms from the response
            const newDataRooms = response.buckets.map((room: DataRoom) => ({
                id: room.uuid,
                title: room.bucketName,
                bucketName: room.bucketName,
                uuid: room.uuid,
                lastOpened: new Date(room.addedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                }),
                permissionLevel: room.permissionLevel,
                sharedBy: room.sharedBy,
                users: room.users,
                status: room.status || 'ready' // Default to 'ready' if status is not provided
            }));

            // Update invited rooms from the response
            const newInvitedDatarooms = response.invited.map((room: InvitedRoom) => ({
                bucketId: room.uuid,
                bucketName: room.bucketName,
                sharedBy: room.sharedBy,
                permissionLevel: room.permissionLevel,
                sharedAt: room.sharedAt
            }));

            setDataRooms(newDataRooms);
            setInvitedDatarooms(newInvitedDatarooms);

        } catch (error) {
            console.error('Error fetching spaces:', error);
        } finally {
            setIsLoading(false);
            setIsInvitesLoading(false);
        }
    };

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('color-theme') === 'dark';
        }
        return false;
    });

    useEffect(() => {
        if (activeUser) {
            handleFetchUserAttributes();
        }
    }, [activeUser]);

    async function handleFetchUserAttributes() {
        if (demoMode) {
            setUserAttributes(demoUserAttributes as FetchUserAttributesOutput);
            setFamilyName(demoUserAttributes.family_name);
            setGivenName(demoUserAttributes.given_name);
            return;
        }

        try {
            const attributes = await fetchUserAttributes();
            setUserAttributes(attributes);
            setFamilyName(attributes.family_name || '');
            setGivenName(attributes.given_name || '');
        } catch (error) {
        }
    }

    const handleAcceptInvite = async (bucketId: string) => {
        setPendingAcceptBucketId(bucketId);
        setConfirmationName('');
        setIsAcceptDialogOpen(true);
    };

    const handleConfirmAccept = async () => {
        if (!pendingAcceptBucketId) return;

        const fullName = `${givenName} ${familyName}`;
        if (confirmationName !== fullName) return;

        setIsAccepting(true);
        try {
            const restOperation = post({
                apiName: 'S3_API',
                path: `/share-folder/${pendingAcceptBucketId}/accept-invite`,
                options: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                },
            });

            await restOperation.response;
            // Remove from invited list and refresh datarooms
            setInvitedDatarooms(invitedDatarooms.filter(room => room.bucketId !== pendingAcceptBucketId));
            handleFetchDataRooms();
            setIsAcceptDialogOpen(false);
            setPendingAcceptBucketId(null);
        } catch (error) {
            console.error('Error accepting invite:', error);
        } finally {
            setIsAccepting(false);
        }
    };

    const handleDeclineInvite = async (bucketId: string) => {
        try {
            const restOperation = post({
                apiName: 'S3_API',
                path: `/share-folder/${bucketId}/decline-invite`,
                options: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                },
            });

            await restOperation.response;
            // Remove from invited list
            setInvitedDatarooms(invitedDatarooms.filter(room => room.bucketId !== bucketId));
        } catch (error) {
            console.error('Error declining invite:', error);
        }
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        async function initializeDashboard() {
            try {
                await handleFetchUserAttributes();
                await handleFetchDataRooms();
            } catch (error) {
                console.error('Error initializing dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (activeUser) {
            initializeDashboard();
        }
    }, [activeUser]);

    async function handleSignOut() {
        try {
            if (!demoMode) {
                await signOut();
            }
            router.replace('/signin');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    const visibleDataRooms = searchValue.trim()
        ? dataRooms.filter((room) =>
            room.title?.toLowerCase().includes(searchValue.trim().toLowerCase()))
        : dataRooms;

    const createDialog = (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="rounded-card dark:bg-darkbg dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-ink dark:text-white">Make a new space</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-ink dark:text-slate-300">
                    A space is a spot for your stuff — receipts, screenshots, leases, anything.
                </p>
                <Input
                    value={newDataroomName}
                    onChange={(e) => setNewDataroomName(e.target.value)}
                    placeholder="Name this space"
                    className="h-12 rounded-lg border-hairline focus-visible:ring-ink dark:bg-darkbg dark:text-white"
                    disabled={isCreating}
                />
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        className="h-12 px-6"
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddDataroom}
                        className="h-12 px-6"
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Making it...
                            </span>
                        ) : (
                            'Make it'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        isLoading ? (
            <div className="grid h-screen place-items-center bg-white dark:bg-darkbg">
                <CircularProgress value={0.5} />
            </div>
        ) : userAttributes ?
            <div className="min-h-screen w-full bg-white dark:bg-darkbg">
                {/* Top nav */}
                <header className="sticky top-0 z-40 h-20 bg-white/95 backdrop-blur-sm border-b border-hairline dark:bg-darkbg dark:border-gray-800">
                    <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between px-6">
                        <span className="text-[22px] font-bold tracking-tight text-rausch select-none">
                            AnyStore
                        </span>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setIsAddDialogOpen(true)}
                                variant="ghost"
                                className="hidden sm:flex rounded-full text-ink hover:bg-surface-soft dark:text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" /> New space
                            </Button>
                            <Popover>
                                <PopoverTrigger className="h-10 w-10 rounded-full bg-ink text-white text-sm font-medium flex items-center justify-center">
                                    {userAttributes?.given_name && userAttributes?.family_name
                                        ? (givenName[0] + familyName[0]).toUpperCase()
                                        : 'U'}
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-0 rounded-card border-hairline shadow-float" align="end">
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 px-4 py-3 text-ink hover:bg-surface-soft w-full text-sm rounded-t-card"
                                    >
                                        <LogOut size={14} />
                                        <span>Log out</span>
                                    </button>
                                    <div className="h-px bg-hairline-soft" />
                                    <button
                                        onClick={toggleDarkMode}
                                        className="flex items-center gap-2 px-4 py-3 text-ink hover:bg-surface-soft w-full text-sm rounded-b-card"
                                    >
                                        {isDarkMode ? 'Switch to light' : 'Switch to dark'}
                                    </button>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-[1120px] px-6 pb-16">
                    {/* Greeting + search */}
                    <section className="pt-16">
                        <h1 className="text-[28px] font-bold leading-snug text-ink dark:text-white">
                            {givenName ? `Welcome back, ${givenName}` : 'Welcome back'}
                        </h1>
                        <p className="mt-1 text-base text-muted-ink dark:text-slate-300">
                            Drop anything in. Find it later by asking like a person.
                        </p>

                        <form
                            className="mt-8 flex h-16 w-full max-w-2xl items-center rounded-full border border-hairline bg-white pl-6 pr-2 shadow-float dark:bg-slate-900 dark:border-gray-700"
                            onSubmit={(e) => e.preventDefault()}
                            role="search"
                        >
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="Ask about anything you saved…"
                                className="h-full flex-1 bg-transparent text-base text-ink placeholder:text-muted-ink outline-none dark:text-white"
                            />
                            <button
                                type="submit"
                                aria-label="Search"
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rausch text-white transition-colors hover:bg-rausch-active"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </form>
                    </section>

                    {/* Spaces */}
                    <section className="mt-16">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[20px] font-semibold text-ink dark:text-white">Your spaces</h2>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="h-12 px-6">
                                <Plus className="mr-2 h-4 w-4" /> New space
                            </Button>
                        </div>

                        <div className="mt-6">
                            {isLoading ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <SkeletonCard />
                                    <SkeletonCard />
                                    <SkeletonCard />
                                </div>
                            ) : dataRooms.length === 0 ? (
                                <div className="flex flex-col items-center rounded-card border-2 border-dashed border-hairline px-8 py-16 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-soft">
                                        <Inbox className="h-6 w-6 text-muted-ink" />
                                    </div>
                                    <h3 className="mt-4 text-[20px] font-semibold text-ink dark:text-white">Nothing here yet</h3>
                                    <p className="mt-1 max-w-sm text-sm text-muted-ink dark:text-slate-300">
                                        Make a space and drop in receipts, screenshots, leases —
                                        anything you&apos;ll want to find later.
                                    </p>
                                    <Button onClick={() => setIsAddDialogOpen(true)} className="mt-6 h-12 px-6">
                                        Drop something in
                                    </Button>
                                </div>
                            ) : visibleDataRooms.length === 0 ? (
                                <p className="py-8 text-sm text-muted-ink dark:text-slate-300">
                                    No spaces match &ldquo;{searchValue.trim()}&rdquo; — try another word.
                                </p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {visibleDataRooms.map((room) => (
                                        <DataRoomCard
                                            key={room.id}
                                            id={room.id || ''}
                                            title={room.title}
                                            users={room.users || []}
                                            lastOpened={room.lastOpened}
                                            permissionLevel={room.permissionLevel}
                                            sharedBy={room.sharedBy || ''}
                                            status={room.status || 'READY'}
                                            onClick={() => {
                                                if (room.status === 'READY' || !room.status) {
                                                    handleDataRoomClick(room.id);
                                                }
                                            }}
                                            onDelete={() => {
                                                setDataRooms(prevRooms => prevRooms.filter(r => r.id !== room.id));
                                            }}
                                            onLeave={() => {
                                                setDataRooms(prevRooms => prevRooms.filter(r => r.id !== room.id));
                                            }}
                                            onRetry={(newDataroom) => {
                                                setDataRooms(prevRooms => [...prevRooms, newDataroom]);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Shared with you */}
                    {(isInvitesLoading || invitedDatarooms.length > 0) && (
                        <section className="mt-16">
                            <h2 className="text-[20px] font-semibold text-ink dark:text-white">Shared with you</h2>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {isInvitesLoading ? (
                                    <>
                                        <SkeletonInvite />
                                        <SkeletonInvite />
                                    </>
                                ) : (
                                    invitedDatarooms.map((room) => (
                                        <div
                                            key={room.bucketId}
                                            className="rounded-card border border-hairline bg-white p-6 transition-shadow hover:shadow-float dark:bg-slate-900 dark:border-gray-700"
                                        >
                                            <h3 className="text-base font-semibold text-ink dark:text-white">{room.bucketName}</h3>
                                            <p className="mt-1 text-sm text-muted-ink dark:text-slate-300">
                                                Shared by {room.sharedBy}
                                            </p>
                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    onClick={() => handleAcceptInvite(room.bucketId)}
                                                    className="h-9 px-4 text-sm"
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleDeclineInvite(room.bucketId)}
                                                    className="h-9 px-4 text-sm"
                                                >
                                                    No thanks
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {/* Recent saves */}
                    <section className="mt-16">
                        <h2 className="text-[20px] font-semibold text-ink dark:text-white">Recent saves</h2>
                        <div className="mt-6 flex items-center gap-3 rounded-card border border-hairline-soft bg-surface-soft px-6 py-5 dark:bg-slate-900 dark:border-gray-700">
                            <Sparkles className="h-4 w-4 shrink-0 text-muted-ink" />
                            <p className="text-sm text-muted-ink dark:text-slate-300">
                                Nothing saved recently — your latest drops will show up here.
                            </p>
                        </div>
                    </section>
                </main>

                {createDialog}

                {/* Accept invite confirmation dialog */}
                <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
                    <DialogContent className="rounded-card dark:bg-darkbg dark:text-white">
                        <DialogHeader>
                            <DialogTitle className="text-ink dark:text-white">Join this space</DialogTitle>
                        </DialogHeader>
                        <div className="my-4">
                            <p className="text-sm mb-4 text-muted-ink dark:text-slate-300">
                                By joining this space, you agree to keep anything shared with you private.
                            </p>
                            <p className="text-sm font-medium mb-2 text-ink dark:text-white">Type your full name to confirm:</p>
                            <Input
                                value={confirmationName}
                                onChange={(e) => setConfirmationName(e.target.value)}
                                placeholder={`${givenName} ${familyName}`}
                                className="h-12 rounded-lg border-hairline focus-visible:ring-ink dark:bg-darkbg dark:text-white"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && confirmationName === `${givenName} ${familyName}` && !isAccepting) {
                                        handleConfirmAccept();
                                    }
                                }}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsAcceptDialogOpen(false);
                                    setPendingAcceptBucketId(null);
                                }}
                                className="h-12 px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmAccept}
                                disabled={confirmationName !== `${givenName} ${familyName}` || isAccepting}
                                className="h-12 px-6"
                            >
                                {isAccepting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Joining...
                                    </span>
                                ) : (
                                    'Join space'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div> :
            <div className="grid h-screen place-items-center bg-white dark:bg-darkbg">
                <CircularProgress value={0.5} />
            </div>
    );
}
