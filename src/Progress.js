import React, { Component } from 'react';
import {conduct} from './lodux';

class Progress extends Component {

  handleDone(list) {
    const {done} = this.props;
    done(list);
  }

  handleDoneAll() {
    const {doneAll} = this.props;
    doneAll();
  }

  render() {
    const {lists = {}} = this.props;
    return (
      <div>
        <h2>Progress</h2>
        <ul>
          {Object.keys(lists).map(key => {
            return <li key={key}>{key}: {lists[key].items.length} items remaining&nbsp; 
              <button onClick={() => this.handleDone(key)}>done</button>
            </li>;
          })}
        </ul>
        <button onClick={() => this.handleDoneAll()}>done all</button>
      </div>
    );
  }
}

import Todo, {empty} from './Todo';

// returns data to be initialized for this container and regular props from state
// path = ContainerReducer.${container.name}.${instance}
const mapStateToProps = (state, own_props, conget) => {
  return {
    lists: conget( Todo )
  };
}

// act = dispatch action on self
// contact = dispatch action on an instance of another container
const mapActToProps = (own_props, act, contact) => {
  return {
    done: (list) => {
      // dispatch "empty" action on single Todo instance ${list}
      contact( Todo, list, empty );
    },
    doneAll: () => {
      // dispatch "empty" action on all Todo instances
      contact( Todo, '*', empty );
    }
  }
}

export default conduct(mapStateToProps, mapActToProps)(Progress);
