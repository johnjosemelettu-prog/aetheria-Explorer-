
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = `Firestore Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-slate-900 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black font-headline text-white mb-4 uppercase italic tracking-tighter">System Interruption</h2>
            <p className="text-slate-400 mb-8 max-w-md font-medium leading-relaxed">
              {errorMessage}
            </p>
            <Button
                onClick={this.handleReset}
                className="h-14 px-8 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl font-black text-sm uppercase tracking-widest flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" /> Reset Protocol
            </Button>
          </div>
      );
    }

    return <>{this.props.children}</>;
  }
}
