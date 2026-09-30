"use client";

import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export function Logout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/login";
          },
        },
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      disabled={isLoggingOut}
      className="group/logout gap-2 border-zinc-200 text-zinc-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:bg-red-100 disabled:pointer-events-none disabled:opacity-70"
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="size-4 animate-spin text-red-600" />
          <span className="font-semibold text-red-600">Signing out...</span>
        </>
      ) : (
        <>
          <span>Logout</span>
          <LogOut className="size-4 text-zinc-500 transition-colors group-hover/logout:text-red-600" />
        </>
      )}
    </Button>
  );
}
