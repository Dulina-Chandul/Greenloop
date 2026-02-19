const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Nav ── */}
      <nav className="w-full px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">GreenLoop</span>
        </div>
        <a
          href="/login"
          className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
        >
          Sign in →
        </a>
      </nav>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 sm:py-28 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-100 rounded-full blur-2xl opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            AI-Powered Waste Marketplace
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
            Turn Your Waste Into{" "}
            <span className="text-green-600">Worth</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            GreenLoop connects households and businesses with scrap collectors through
            AI-powered identification and competitive live bidding — helping Sri Lanka
            recycle smarter.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href="/seller/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 active:bg-green-800 transition-all shadow-sm shadow-green-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Register as Seller
            </a>
            <a
              href="/collector/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 border border-gray-200 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Register as Collector
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-green-700 text-sm font-semibold rounded-xl hover:bg-green-50 transition-all"
            >
              Sign in
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-y border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "7,000+", label: "Tons of waste daily in Sri Lanka" },
            { value: "40%", label: "Recyclable but currently dumped" },
            { value: "15K+", label: "Collectors empowered" },
            { value: "Rs. 4.7B", label: "Annual economic potential" },
          ].map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{s.value}</div>
              <div className="text-xs text-gray-500 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How GreenLoop Works</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Smart technology meeting real-world waste challenges</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "ScrapLens AI",
                desc: "Snap a photo of your waste. Our AI identifies materials and estimates market value in seconds.",
                color: "bg-green-50 text-green-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Reverse Auction Bidding",
                desc: "Multiple collectors compete for your waste, driving prices up. You always get the best deal.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Smart Geo Matching",
                desc: "Set a pickup radius. Only nearby collectors see your listing — faster pickups, less fuel waste.",
                color: "bg-teal-50 text-teal-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ),
                title: "EcoMate AI Chat",
                desc: "Multilingual AI guide (Sinhala, Tamil, English) for recycling tips and creative upcycling ideas.",
                color: "bg-lime-50 text-lime-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Safe & Secure",
                desc: "No personal numbers shared until a deal is confirmed. In-app chat keeps transactions private.",
                color: "bg-green-50 text-green-600",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Analytics Dashboard",
                desc: "Track earnings, waste diverted, and performance — both for sellers and collectors.",
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all group">
                <div className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-800 to-emerald-700 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="relative z-10 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to make a difference?</h2>
            <p className="text-green-200 text-sm max-w-md mx-auto">
              Join thousands of Sri Lankans turning recyclable waste into income — while protecting the environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/seller/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-700 text-sm font-bold rounded-xl hover:bg-green-50 transition-all"
              >
                Start as a Seller
              </a>
              <a
                href="/collector/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600/50 text-white text-sm font-bold rounded-xl hover:bg-green-600/70 border border-white/20 transition-all"
              >
                Join as a Collector
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-6 px-4 text-center">
        <p className="text-xs text-gray-400">
          Built with 💚 by <span className="font-medium text-gray-500">Team Cronuz</span> · C.W.W. Kannangara Central College · DEV{"{"}thon{"}"} 3.0
        </p>
      </footer>
    </div>
  );
};

export default Home;