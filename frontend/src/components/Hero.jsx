/**
 * Premium hero for the prediction dashboard. Pure presentation — no
 * props, no state, no API calls. The car illustration is an inline SVG
 * line-art silhouette (gradient stroke) rather than a bundled photo, to
 * keep this section lightweight.
 */
function Hero() {
  return (
    <header className="dashboard-hero">
      <div className="dashboard-hero-text">
        <p className="dashboard-hero-eyebrow">EXPLAINABLE AI CAR VALUATION</p>
        <h1 className="dashboard-hero-title">Know Your Car&rsquo;s True Value</h1>
        <p className="dashboard-hero-subtitle">
          Get an intelligent vehicle valuation and understand the factors
          influencing the estimated price.
        </p>
      </div>

      <div className="dashboard-hero-visual" aria-hidden="true">
        <div className="hero-glow" />
        <svg viewBox="0 0 320 180" className="hero-car-svg">
          <defs>
            <linearGradient id="carStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--secondary)" />
            </linearGradient>
          </defs>
          <path
            d="M28 118 C30 96 48 84 70 82 L108 60 C118 54 130 51 142 51 L196 51
               C210 51 223 56 233 65 L252 82 C270 84 288 92 292 112
               C293 118 290 122 284 122 L268 122
               M76 122 L244 122
               M28 118 L18 118 C12 118 8 114 8 108 L8 100"
            fill="none"
            stroke="url(#carStroke)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M112 60 L128 82 L206 82 L222 60"
            fill="none"
            stroke="url(#carStroke)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
          <circle cx="90" cy="122" r="16" fill="none" stroke="url(#carStroke)" strokeWidth="3" />
          <circle cx="90" cy="122" r="4.5" fill="var(--secondary)" />
          <circle cx="238" cy="122" r="16" fill="none" stroke="url(#carStroke)" strokeWidth="3" />
          <circle cx="238" cy="122" r="4.5" fill="var(--primary)" />
          <path d="M8 100 C8 70 30 46 62 46" fill="none" stroke="url(#carStroke)" strokeWidth="1.5" opacity="0.3" strokeDasharray="2 6" strokeLinecap="round" />
        </svg>
      </div>
    </header>
  )
}

export default Hero
