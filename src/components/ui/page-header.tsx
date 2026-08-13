import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}>) {
  return (
    <header className="ui-page-header">
      <div className="ui-page-header-copy">
        {eyebrow ? <p className="ui-page-eyebrow">{eyebrow}</p> : null}
        <h1 className="ui-page-title">{title}</h1>
        {description ? (
          <p className="ui-page-description">{description}</p>
        ) : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </header>
  );
}
