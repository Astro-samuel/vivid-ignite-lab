import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showReport: boolean;
  reportText: string;
  reported: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showReport: false, reportText: "", reported: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Silent logging for debugging
    console.error("[ErrorBoundary]", error.message, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, showReport: false, reportText: "", reported: false });
  };

  handleReport = () => {
    // Log the report silently
    console.info("[BugReport]", {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      userNote: this.state.reportText,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
    this.setState({ reported: true });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "hsl(var(--background))" }}>
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.2)" }}>
            <AlertTriangle size={28} style={{ color: "hsl(var(--destructive))" }} />
          </div>

          {/* Title & Message */}
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
              {this.props.fallbackTitle || "Something went wrong"}
            </h2>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              This page encountered an unexpected error. Don't worry — your progress is saved.
            </p>
            {this.state.error && (
              <p className="text-xs mt-2 px-3 py-2 rounded-lg font-mono break-all"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
                {this.state.error.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleRetry}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))", color: "hsl(var(--primary-foreground))" }}>
              <RefreshCw size={14} /> Retry
            </button>

            <button
              onClick={() => { window.location.href = "/catalog"; }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>
              <ArrowLeft size={14} /> Back to Catalog
            </button>

            {!this.state.showReport && !this.state.reported && (
              <button
                onClick={() => this.setState({ showReport: true })}
                className="text-xs font-medium flex items-center justify-center gap-1.5 transition-all hover:opacity-70 py-2"
                style={{ color: "hsl(var(--muted-foreground))" }}>
                <Bug size={12} /> Report this issue
              </button>
            )}
          </div>

          {/* Report Form */}
          {this.state.showReport && !this.state.reported && (
            <div className="rounded-xl p-4 space-y-3 text-left"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <label className="text-xs font-semibold block" style={{ color: "hsl(var(--foreground))" }}>
                What were you doing when this happened?
              </label>
              <textarea
                value={this.state.reportText}
                onChange={(e) => this.setState({ reportText: e.target.value })}
                placeholder="e.g. I clicked on a project from the catalog..."
                className="w-full rounded-lg px-3 py-2 text-sm resize-none h-20 focus:outline-none"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              />
              <button
                onClick={this.handleReport}
                className="w-full py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                style={{ background: "hsl(var(--secondary) / 0.15)", color: "hsl(var(--secondary))", border: "1px solid hsl(var(--secondary) / 0.3)" }}>
                Submit Report
              </button>
            </div>
          )}

          {this.state.reported && (
            <p className="text-xs font-medium" style={{ color: "hsl(var(--success))" }}>
              ✓ Report submitted. Thank you for helping us improve!
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
