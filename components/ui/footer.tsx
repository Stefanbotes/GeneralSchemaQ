
// Footer component matching original design
export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="footer-logo">
            <div className="logo">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                Leadership
              </span>
              <span className="text-2xl font-light text-gray-400 ml-2">
                Personas
              </span>
            </div>
          </div>
        </div>
        <p className="text-center text-sm">
          © 2025 Inner Personas Assessment. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
