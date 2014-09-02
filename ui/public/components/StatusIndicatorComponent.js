/**
 * @jsx React.DOM
 */
'use strict';



var
    React = require('react'),
    classSet = require('react/lib/cx'),
    config = window.config;



var GameComponent = module.exports = React.createClass({



    getInitialState: function() {
        return {};
    },



    componentDidMount: function() {
    },
    
    
    
    reset: function() {
        this.replaceState(this.getInitialState());
    },
    
    
    
    render: function() {
        
        var classes = classSet({
            'status-indicator': true,
            'status-indicator--unknown': typeof this.props.state === 'undefined',
            'status-indicator--positive': this.props.state || this.props.state === 'warning',
            'status-indicator--negative': typeof this.props.state !== 'undefined' && !this.props.state,
            'status-indicator--warning': this.props.state === 'warning'
        });
        
        return <div className={classes}></div>;   
    }
    

    
});