/**
 *  :: Brain Cloud Dream Journal ::
 *
 *  Dream Journal App - Record and Search Daily Dream Entries
 *  https://github.com/gitbrent/dream-journal-app
 *
 *  This library is released under the MIT Public License (MIT)
 *
 *  Dream Journal App (C) 2019-present Brent Ely (https://github.com/gitbrent)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { APP_VER } from './app.types'
//import '../css/purged.css' // FIXME: how do we purge scss??
import '../css/react-tags.css'
import '../css/style.scss'
import AppMain from './appmain'

// App Logic
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IAppProps { }

class App extends React.Component<IAppProps> {
	constructor(props: Readonly<IAppProps>) {
		super(props)
		console.log(APP_VER)
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	componentDidCatch = (error: any, errorInfo: any) => {
		this.setState({ appErrMsg: error.toString() })
		console.error(error)
		console.error(errorInfo)
	}

	render() {
		return <AppMain />
	}
}

// App Container
ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
