'use client';
import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <span className="text-2xl">&#9888;</span>
          </div>
          <h2 className="text-white font-semibold mb-2">Une erreur est survenue</h2>
          <p className="text-gray-400 text-sm mb-4 max-w-xs">{this.state.error?.message ?? 'Erreur inattendue'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#25D366', color: '#fff' }}
          >
            Reessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
