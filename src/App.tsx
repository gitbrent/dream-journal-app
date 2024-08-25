import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
	const [count, setCount] = useState(0)

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<div className="container py-4 px-3 mx-auto">
				<h1>Hello, Bootstrap and Vite!</h1>
				<button className="btn btn-primary">Primary button</button>
			</div>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					{/* TODO: import.meta.env.VITE_GDRIVE_CLIENT_ID */}
				</p>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more bitch!
			</p>
		</>
	)
}

export default App
