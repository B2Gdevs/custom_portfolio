import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="brutal-border bg-secondary p-12">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
        <p className="text-xl text-text-muted mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="brutal-button px-8 py-4 bg-accent text-secondary inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

