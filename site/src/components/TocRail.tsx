import * as React from "react"

/**
 * TocRail: the right-hand table-of-contents rail from prototype p4
 * (direction D). Sticky, visible >=1080px, tracks the active section with
 * an IntersectionObserver. Hidden on smaller viewports like the prototype.
 */

export function TocRail({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = React.useState(items[0]?.id ?? "")

  React.useEffect(() => {
    if (!items.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-72px 0px -60% 0px", threshold: 0 },
    )
    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  if (items.length < 2) return null

  return (
    <nav aria-label="On this page" className="toc-rail sticky top-[73px] hidden max-h-[calc(100vh-90px)] w-[200px] shrink-0 self-start overflow-y-auto py-10 pr-4 lg:block" data-testid="toc-rail">
      <div className="mb-2.5 pl-3 font-semibold uppercase tracking-[0.12em] text-[var(--prui-dim)]" style={{ fontSize: "10.5px" }}>
        on this page
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={
                "block border-l-2 py-1 pl-3 text-[12.5px] no-underline transition-colors " +
                (active === item.id
                  ? "border-[var(--prui-brand)] text-[var(--prui-brand)]"
                  : "border-[var(--prui-line)] text-[var(--prui-dim)] hover:text-[var(--prui-fg)]")
              }
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
