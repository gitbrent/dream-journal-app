/**
 * Date Range Picker
 */

import React from 'react'
import Helmet from 'react-helmet'
import DayPicker, { DateUtils } from 'react-day-picker'
import '../css/daypicker.css'

export default class DateRangeSelector extends React.Component {
	constructor(props) {
		super(props)
		this.handleDayClick = this.handleDayClick.bind(this)
		this.handleResetClick = this.handleResetClick.bind(this)
		this.state = this.getInitialState()
	}
	getInitialState() {
		return {
			from: this.props.dateRangeFrom || undefined,
			to: this.props.dateRangeTo || undefined,
			numberOfMonths: this.props.numberOfMonths || 3,
		}
	}

	handleDayClick(day) {
		const range = DateUtils.addDayToRange(day, this.state)
		this.setState(range)
		if (this.props.onChange) this.props.onChange(range)
	}
	handleResetClick() {
		let newState = {
			from: undefined,
			to: undefined,
		}
		this.setState(newState)
		if (this.props.onChange) this.props.onChange(newState)
	}

	render() {
		const { from, to } = this.state
		const modifiers = { start: from, end: to }
		return (
			<div className='DateRangeSelector'>
				<div className='row justify-content-center align-items-center'>
					<div className='col-auto'>
						<h5 className='text-primary mb-0'>
							{!from && !to && 'Please select the first day.'}
							{from && !to && 'Please select the last day.'}
							{from && to && `Range Selected: ${from.toLocaleDateString()} to ${to.toLocaleDateString()}`}
						</h5>
					</div>
					<div className='col-auto'>
						{from && to && (
							<button className='btn btn-sm btn-outline-secondary' onClick={this.handleResetClick}>
								Reset
							</button>
						)}
					</div>
				</div>
				<DayPicker
					className='Selectable'
					numberOfMonths={this.state.numberOfMonths}
					selectedDays={[from, { from, to }]}
					modifiers={modifiers}
					onDayClick={this.handleDayClick}
					toMonth={new Date()}
				/>
				<Helmet>
					<style>{`
					  .Selectable .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
					    background-color: var(--gray) !important;
					    color: var(--white);
					  }
					  .Selectable .DayPicker-Day {
					    border-radius: 0 !important;
					  }
					  .Selectable .DayPicker-Day--start {
					    border-top-left-radius: 50% !important;
					    border-bottom-left-radius: 50% !important;
					  }
					  .Selectable .DayPicker-Day--end {
					    border-top-right-radius: 50% !important;
					    border-bottom-right-radius: 50% !important;
					  }
					`}</style>
				</Helmet>
			</div>
		)
	}
}
