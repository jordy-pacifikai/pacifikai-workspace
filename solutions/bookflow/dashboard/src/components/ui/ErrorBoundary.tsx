'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('[ErrorBoundary] Unhandled React error', {
      action: 'error_boundary_catch',
      error: error.message,
      stack: info.componentStack ?? undefined,
    } as Record<string, unknown>);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-6 py-10">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
            <AlertTriangle size={28} className="text-red-400" />
          </div>

          {/* Heading */}
          <h2 className="text-white font-semibold text-base mb-2">
            Oops, quelque chose s&apos;est mal passé
          </h2>

          {/* Error message */}
          <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
            {this.state.error?.message ?? 'Une erreur inattendue est survenue.'}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-950 transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#25D366' }}
            >
              Réessayer
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
