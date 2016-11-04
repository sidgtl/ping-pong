/**
 * @jsx React.DOM
 */
'use strict';

var
	React = require('react'),
	config = window.config,
	node = require('../js/node');

var AdminComponent = module.exports = React.createClass({

	getInitialState: function() {
		return {
			active: false
		};
	},

	componentDidMount: function() {
		var _this = this;

		window.addEventListener('keypress', this.handleKeypress);
	},

	handleKeypress: function(e) {
		switch(e.which) {
			// letter a
			case 97:
				this.toggle();
				break;
		}
	},

	toggle: function() {
		this.setState({
			active: this.state.active ? 0 : 1
		});
	},

	render: function() {
		var containerClass = 'admin-container';

		if (this.state.active) {
			containerClass += ' active';
		}

		return (
			<div className={containerClass}>
				<article className='modal'>
					<header className='modal-header'>
						<h2>Players</h2>
						<button type="submit" id="admin-player-add" className='modal-header-add'></button>
					</header>
					<section className='modal-section'>
						<header className='modal-section-header'>List</header>
						<ul className='modal-section-list'>
							<li></li>
						</ul>
					</section>
				</article>
			</div>
		);
	}
});