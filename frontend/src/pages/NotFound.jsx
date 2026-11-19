import { Compass } from "lucide-react";

import { ButtonLink } from "../components/ui/Button";

function NotFound() {
  const signedIn = Boolean(localStorage.getItem("token"));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Compass className="h-12 w-12 text-indigo-500" aria-hidden="true" />
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">The page you&apos;re looking for doesn&apos;t exist.</p>
      <ButtonLink to={signedIn ? "/dashboard" : "/"} className="mt-8">
        {signedIn ? "Back to dashboard" : "Go to login"}
      </ButtonLink>
    </div>
  );
}

export default NotFound;
