import { AccessForm } from "../../modules/auth/components/access-form";
import { normalizeReturnTo } from "../../modules/auth/redirects";

type AccessPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const parameters = await searchParams;
  const returnTo = normalizeReturnTo(parameters.returnTo);

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="access-heading">
        <p className="auth-brand">StudioFlow</p>
        <h1 id="access-heading">Access Entry</h1>
        <p className="auth-method">Email Magic Link</p>

        <AccessForm returnTo={returnTo} />
      </section>
    </main>
  );
}
