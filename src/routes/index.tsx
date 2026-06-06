import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-md">
        <div className="page-wrap flex items-center justify-between py-4">
          <span className="display-title text-xl font-bold tracking-tight text-[var(--neon)]">
            Rock Paper Scissors
          </span>
          <nav className="flex gap-6 text-sm font-medium">
            <Link to="/" className="nav-link is-active">
              Home
            </Link>
            <Link to="/game" className="nav-link">
              Play
            </Link>
          </nav>
        </div>
      </header>

      <main className="page-wrap py-16">
        <section className="rise-in island-shell rounded-2xl p-10 md:p-14">
          <h1 className="display-title text-4xl font-bold tracking-tight text-[var(--ink)] md:text-5xl">
            Rock Paper Scissors
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
            Show your hand, beat the computer, and win the round. Best of luck.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/game" className="neon-button">
              Let&apos;s play
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Rock',
              desc: 'Closed fist. Beats scissors.',
            },
            {
              title: 'Paper',
              desc: 'Open hand. Beats rock.',
            },
            {
              title: 'Scissors',
              desc: 'Two fingers out. Beats paper.',
            },
          ].map((card, i) => (
            <article
              key={card.title}
              className="feature-card rise-in island-shell rounded-xl p-6"
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              <h2 className="display-title text-lg font-semibold text-[var(--neon-bright)]">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                {card.desc}
              </p>
            </article>
          ))}
        </section>
      </main>

      <footer className="site-footer mt-16 py-8">
        <div className="page-wrap text-center text-sm text-[var(--ink-soft)]">
          Rock Paper Scissors
        </div>
      </footer>
    </div>
  )
}
