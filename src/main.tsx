import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './scss/styles.scss' // Import our custom CSS
import './scss/react-tags.scss'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as bootstrap from 'bootstrap' // Import all of Bootstrap's JS

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)

// Global error handling for uncaught errors
window.addEventListener('error', (event) => {
	console.error('Uncaught error:', event.error);
	// You can also show a user-friendly message or log this error to a service
});

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
	console.error('Unhandled promise rejection:', event.reason);
	// You can also show a user-friendly message or log this error to a service
});
