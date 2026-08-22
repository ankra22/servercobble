import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-3xl justify-center px-4 py-16 sm:px-6">
      <SignUp />
    </div>
  );
}
