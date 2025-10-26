// components/footer.tsx (or wherever you keep it)
export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-6 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="footer-logo">
            <div className="logo flex items-baseline">
              {/* Brand wordmark with token-based gradient */}
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Leadership
              </span>
              <span className="text-2xl font-light ml-2 opacity-80">
                Personas
              </span>
            </div>
          </div>
        </div>
        <p className="text-center text-sm opacity-80">
          © {new Date().getFullYear()} Inner Personas Assessment. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

