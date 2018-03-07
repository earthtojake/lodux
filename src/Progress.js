import React, { Component } from 'react';
import {conduct} from '../redact';

class Progress extends Component {

  handleDone(list) {
    const {done} = this.props;
    done(list);
  }

  handleDoneAll() {
    const {doneAll} = this.props;
    doneAll();
  }

  handleChangeStatus(e) {
    const {setInputAll} = this.props;
    setInputAll(e.target.value);
  }

  handleAddToAll() {
    const {status, addToAll, setInputAll} = this.props;
    if (status !== "") {
      addToAll(status);
      setInputAll("");
    }
  }

  render() {
    const {num_items, status} = this.props;
    return (
      <div>
        <input type="text" value={status} onChange={(e) => this.handleChangeStatus(e)} />
        <button onClick={() => this.handleAddToAll()}>add to all</button>
        <p>Summary:</p>
        <ul>
          {Object.keys(num_items).map(key => {
            return <li key={key}>{key}: {num_items[key]} items remaining&nbsp; 
              <button onClick={() => this.handleDone(key)}>done</button>
            </li>;
          })}
        </ul>
        <button onClick={() => this.handleDoneAll()}>done all</button>
      </div>
    );
  }
}

import Todo, {empty, addItem, setInput } from './Todo';

// returns data to be initialized for this container and regular props from state
// path = ContainerReducer.${container.name}.${instance}
const mapStateToProps = (state, own_props, conget) => {
  return {
    num_items: conget( Todo, '*', 'items.length' ),
    status: "",
  };
}

const setInputAll = (status) => ({
  status: {$set: status}
})

// act = dispatch action on self
// contact = dispatch action on an instance of another container
const mapActToProps = (own_props, act, contact) => {
  return {
    setInputAll: (status) => {
      act( setInputAll(status) );
      contact( Todo, '*', setInput(status) );
    },
    addToAll: (value) => {
      contact( Todo, '*', addItem(value) )
      contact( Todo, '*', setInput("") );
    },
    done: (list_id) => contact( Todo, list_id, empty ),
    doneAll: () => contact( Todo, '*', empty )
  }
}

export default conduct(mapStateToProps, mapActToProps)(Progress);
