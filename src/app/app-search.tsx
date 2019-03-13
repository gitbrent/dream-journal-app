import React from 'react'

class TabSearch extends React.Component {
	render() {
		return (
			<div className='container mt-3'>
				<h2 className='text-primary mb-3'>Search Dream Journal</h2>

				<div className='row'>
					<div className='col-auto'>
						<h1 className='text-primary'>TODO</h1>
					</div>
					<div className='col-auto'>
						<h6 id='appVer' className='text-black-50 font-weight-light' />
					</div>
				</div>
			</div>
		)
	}
}

export default TabSearch
