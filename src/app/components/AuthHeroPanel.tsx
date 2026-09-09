import { ImageWithFallback } from './figma/ImageWithFallback';

const heroImage = '/branding/login-hero-somalia.png';

export function AuthHeroPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden rounded-3xl">
      <ImageWithFallback
        src={heroImage}
        alt="Aerial view of Somalia coastline"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-[#1f3460]/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-[#0a1628]/20" />

      <div className="relative z-10 flex flex-col justify-end p-12 pb-14 w-full">
        <h1 className="auth-display-title text-white text-[2.75rem] font-bold leading-[1.1] tracking-tight mb-4">
          HUMANITY HUB.<br />SOMALIA
        </h1>
        <p className="text-white/70 text-[1rem] leading-relaxed max-w-[400px] mb-10">
          A decision support tool built for humanitarian and development operations.
        </p>

        <p className="text-xs text-[#4FA8DA] tracking-[0.25em] uppercase font-medium">
          Decision Support Intelligence
        </p>
      </div>
    </div>
  );
}
