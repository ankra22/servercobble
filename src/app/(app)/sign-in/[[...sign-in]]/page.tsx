import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-full justify-center bg-nv px-4 py-16 sm:px-6">
      <SignIn />
    </div>
  );
}
