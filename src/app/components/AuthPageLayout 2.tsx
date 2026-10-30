import type { ReactNode } from 'react';
import { AuthHeroPanel } from './AuthHeroPanel';

/** Split auth shell: hero stays viewport-height; form column scrolls when tall. */
export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-svh flex bg-white p-4 overflow-hidden">
      <AuthHeroPanel />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
