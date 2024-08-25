import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
//import './index.css'
// Import our custom CSS
import './scss/styles.scss'
// Import all of Bootstrap's JS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as bootstrap from 'bootstrap'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
