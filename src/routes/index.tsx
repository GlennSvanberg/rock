import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-md">
        <div className="page-wrap flex items-center justify-between py-4">
          <span className="display-title text-xl font-bold tracking-tight text-[var(--neon)]">
            Rock
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
          <p className="island-kicker mb-4">Computer vision</p>
          <h1 className="display-title text-4xl font-bold tracking-tight text-[var(--ink)] md:text-5xl">
            Play Rock with your{' '}
            <span className="text-[var(--neon)]">camera</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
            A dark, neon-green interface for real-time hand gesture recognition.
            Edit <code>src/routes/index.tsx</code> to build the experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/game" className="neon-button">
              Get started
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Camera feed',
              desc: 'Live video stream powered by MediaPipe vision tasks.',
            },
            {
              title: 'Gesture detect',
              desc: 'Recognize rock, paper, and scissors in real time.',
            },
            {
              title: 'Neon UI',
              desc: 'Dark-only theme with electric green accents throughout.',
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
          Rock — dark theme, neon green only
        </div>
      </footer>
    </div>
  )
}
