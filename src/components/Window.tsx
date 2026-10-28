import type { ReactNode } from "react";

/** A classic 1-bit window: striped title bar with a close box, solid offset shadow. */
export function Window({
  title,
  children,
  right,
  id,
  className = "",
}: {
  title: ReactNode;
  children: ReactNode;
  right?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`win ${className}`}>
      <header className="win-bar">
        <span className="win-close" aria-hidden="true" />
        <span className="win-title">{title}</span>
        {right && <span className="win-right">{right}</span>}
      </header>
      <div className="win-body">{children}</div>
    </section>
  );
}
