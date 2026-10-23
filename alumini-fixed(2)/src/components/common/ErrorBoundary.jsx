import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-inter">
            <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-xl w-full">
                <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Oops! Something broke.</h1>
                <p className="text-slate-400 font-medium mb-8 text-sm md:text-base">
                    We've encountered an unexpected error. Please try refreshing the page or return to the home screen.
                </p>

                {import.meta.env.MODE === 'development' && this.state.error && (
                    <div className="bg-black/50 p-4 rounded-xl text-left overflow-x-auto mb-8 border border-red-500/20">
                        <p className="text-rose-400 font-mono text-sm mb-2">{this.state.error.toString()}</p>
                        <p className="text-slate-500 font-mono text-xs whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <RefreshCw size={18} /> Refresh Page
                    </button>
                    <a 
                        href="/"
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Home size={18} /> Go Home
                    </a>
                </div>
            </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
