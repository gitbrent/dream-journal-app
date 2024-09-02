import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// You can also log the error to an error reporting service here
		console.error("Uncaught error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return <section className='container p-5'>
				<div className="alert alert-danger" role="alert">
					<h3 className="alert-heading">Error Boundary</h3>
					<hr />
					<h5>Error.name</h5>
					<p className='mb-0'>{this.state.error?.name}</p>
				</div>
				<pre className='bg-warning text-danger p-4 mt-4'>
					<h5>Error.message</h5>
					{this.state.error?.message}
				</pre>
				<pre className='bg-warning-subtle p-4 mt-4'>
					<h5>Error.stack</h5>
					{this.state.error?.stack}
				</pre>
			</section>;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
