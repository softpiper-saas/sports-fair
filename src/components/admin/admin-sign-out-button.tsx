"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function AdminSignOutButton() {
  const router = useRouter();

  async function onSignOut() {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={onSignOut}>
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
