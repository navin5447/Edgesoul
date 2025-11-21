'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isUserLoggedIn } from '@/lib/offline/localAuth';

const publicPaths = ['/', '/local-auth'];

export function useAuthProtection() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow public paths
    if (publicPaths.includes(pathname)) {
      return;
    }

    // Check if user is logged in
    const loggedIn = isUserLoggedIn();
    if (!loggedIn) {
      router.push('/local-auth');
    }
  }, [pathname, router]);
}
