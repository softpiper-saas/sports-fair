import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, staffRoles, type AuthSession, type StaffRole } from "@/lib/auth";

type StaffSession = AuthSession & {
  user: AuthSession["user"] & {
    role?: string | null;
    banned?: boolean | null;
  };
};

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers()
  });
}

export async function requireStaffSession(allowedRoles: StaffRole[] = [...staffRoles]) {
  const session = (await getCurrentSession()) as StaffSession | null;

  if (!session) {
    redirect("/admin/login");
  }

  if (session.user.banned) {
    redirect("/admin/login?error=banned");
  }

  const role = session.user.role;

  if (!role || !allowedRoles.includes(role as StaffRole)) {
    redirect("/admin/login?error=forbidden");
  }

  return session;
}
