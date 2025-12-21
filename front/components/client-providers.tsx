'use client';

import dynamic from 'next/dynamic';

const DevUserSwitcher = dynamic(
  () => import('@/components/dev-user-switcher'),
  { ssr: false }
);

export default function ClientProviders() {
  return <DevUserSwitcher />;
}
