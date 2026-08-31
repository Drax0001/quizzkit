import Link from "next/link";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { domain } from "@/config/domain.config";

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Join {domain.brand.name}.
        </p>
      </div>
      <SignUpForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
