import Link from "next/link";

export type BreadcrumbItem = Readonly<{ label: string; href?: string }>;

export function Breadcrumb({
  items,
}: Readonly<{ items: readonly BreadcrumbItem[] }>) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="ui-breadcrumb">
        {items.map((item, index) => (
          <li key={`${item.label}:${index}`}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {index < items.length - 1 ? (
              <span aria-hidden="true"> / </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
