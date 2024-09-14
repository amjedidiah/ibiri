'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

type ComponentProps = Record<string, unknown>;

export function withAuth<P extends ComponentProps>(
  WrappedComponent: React.ComponentType<P>
) {
  const AuthComponent: React.FC<P> = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return AuthComponent;
}

export function withoutAuth<P extends ComponentProps>(
  WrappedComponent: React.ComponentType<P>
) {
  const NoAuthComponent: React.FC<P> = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        router.push('/');
      }
    }, [user, loading, router]);

    if (loading || user) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  NoAuthComponent.displayName = `withoutAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return NoAuthComponent;
}
