"use client";

type ErrorPageProps = Readonly<{
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}>;

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main>
      <h1>Application error</h1>
      <button type="button" onClick={reset}>
        Retry
      </button>
    </main>
  );
}
