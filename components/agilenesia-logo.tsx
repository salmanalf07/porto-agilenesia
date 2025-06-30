import Link from "next/link"

export function AgilenesiaLogo() {
  return (
    <Link href="/" className="flex items-center justify-center" aria-label="Agilenesia Home">
      <span className="font-bold text-primary font-heading text-lg md:text-xl">
        Agilenesia <span className="text-secondary">Portfolio</span>
      </span>
    </Link>
  )
}
