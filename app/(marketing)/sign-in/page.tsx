import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { domain } from "@/config/domain.config";

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{domain.brand.name}</h1>
        <p className="text-sm text-muted-foreground">{domain.brand.tagline}</p>
      </div>
      <Suspense>
        <SignInForm />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/sign-up" className="text-primary underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
