import { auth } from "@/lib/auth";

const name = process.env.ADMIN_NAME ?? "Sportsfair Admin";
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

async function main() {
  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("ADMIN_PASSWORD must be at least 10 characters.");
    process.exit(1);
  }

  try {
    await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: "admin"
      }
    });

    console.info(`Created admin user: ${email}`);
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("already")) {
      console.info(`Admin user already exists: ${email}`);
      process.exit(0);
    }

    throw error;
  }
}

void main();
