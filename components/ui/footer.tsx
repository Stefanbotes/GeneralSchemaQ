// components/ui/footer.tsx
export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-6 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <div className="flex justify-center mb-4">
          <div className="footer-logo">
            <div className="logo flex items-baseline">
              {/* Solid color instead of gradient */}
              <span className="text-2xl font-bold text-primary-foreground">
                Inner
              </span>
              <span className="text-2xl font-light ml-2 text-primary-foreground/80">
                Personas
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-sm text-primary-foreground/80">
          © {new Date().getFullYear()} Inner Personas Assessment. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
