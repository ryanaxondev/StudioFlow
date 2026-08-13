import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  id,
}: Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  id?: string;
}>) {
  return (
    <header className="ui-section-header">
      <div className="ui-section-header-copy">
        {eyebrow ? <p className="ui-section-eyebrow">{eyebrow}</p> : null}
        <h2 className="ui-section-title" id={id}>
          {title}
        </h2>
        {description ? (
          <p className="ui-section-description">{description}</p>
        ) : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </header>
  );
}
