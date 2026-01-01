"use client"

import { Button } from "@/components/ui/button"

export function SignInButton() {
    const handleSignIn = async () => {
        // Redirect to the Linux DO OAuth authorization URL directly
        window.location.href = "/api/auth/signin/linuxdo"
    }

    return (
        <form action="/api/auth/signin/linuxdo" method="POST">
            <Button type="submit" size="sm">Sign in with Linux DO</Button>
        </form>
    )
}
