import { Link } from "react-router-dom"
import { Button, Card, CardContent } from "prui/core"

/** Local 404 so the landing chunk never pulls the whole prui/pages layer. */
export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10">
          <code className="text-3xl font-bold text-[var(--prui-fg)]">404</code>
          <p className="text-sm text-[var(--prui-dim)]">This page does not exist or has been moved.</p>
          <Link to="/">
            <Button variant="primary">Go home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
