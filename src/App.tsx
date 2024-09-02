import AppMain from './app/appmain';
import ErrorBoundary from './ErrorBoundary';

function App() {
	return (
		<ErrorBoundary>
			<AppMain />
		</ErrorBoundary>
	);
}

export default App;
