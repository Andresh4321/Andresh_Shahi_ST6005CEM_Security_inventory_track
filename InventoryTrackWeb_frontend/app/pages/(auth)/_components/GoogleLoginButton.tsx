"use client";

import { useEffect, useRef, useState } from 'react';
import { googleLogin } from '@/lib/api/auth';
import { setAuthTokenClient } from '@/lib/api/axois';
import { useRouter } from 'next/navigation';

// Declare the global google type
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

interface GoogleLoginButtonProps {
    onError?: (message: string) => void;
    onSuccess?: () => void;
}

export default function GoogleLoginButton({ onError, onSuccess }: GoogleLoginButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn('Google Client ID not configured');
            return;
        }

        // Load the Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.body.appendChild(script);

        return () => {
            // Cleanup script on unmount
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);

    const initializeGoogleSignIn = () => {
        if (!window.google || !buttonRef.current) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
        });
    };

    const handleCredentialResponse = async (response: any) => {
        if (!response.credential) {
            onError?.('No credential received from Google');
            return;
        }

        setIsLoading(true);
        try {
            const result = await googleLogin(response.credential);

            if (result.success) {
                // Store user and token
                const user = result.data;
                const token = result.token;

                if (user) {
                    localStorage.setItem('inventorytrack_user', JSON.stringify(user));
                }
                if (token) {
                    setAuthTokenClient(token);
                }

                onSuccess?.();
                router.push('/dashboard');
            } else {
                onError?.(result.message || 'Google login failed');
            }
        } catch (err: any) {
            onError?.(err.message || 'Google login failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!GOOGLE_CLIENT_ID) {
        return null; // Don't render button if not configured
    }

    return (
        <div className="w-full">
            {isLoading && (
                <div className="flex items-center justify-center py-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                    <span className="ml-2 text-sm text-muted-foreground">Signing in with Google...</span>
                </div>
            )}
            <div
                ref={buttonRef}
                className={`w-full flex justify-center ${isLoading ? 'hidden' : ''}`}
            />
        </div>
    );
}
