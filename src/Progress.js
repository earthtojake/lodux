import React, { Component } from 'react';
import {conduct} from '../redact';
import Todo from './Todo';

class Progress extends Component {

  static act = {
    setInputAll: (status) => ({
      status: {$set: status}
    })
  }

  static injectProps(store, conget) {
    return {
      num_items: conget( Todo, '*', 'items.length' ),
      titles: conget( Todo, '*', 'title'),
      status: ""
    };
  }

  handleDone(list_id) {
    const {contact} = this.props;
    contact( Todo, list_id, Todo.act.empty )
  }

  handleDoneAll() {
    const {contact} = this.props;
    contact( Todo, '*', Todo.act.empty )
  }

  handleChangeStatus(e) {
    const {setInputAll} = this.props;
    setInputAll(e.target.value);
  }

  handleAddToAll() {
    const {contact, status, setInputAll} = this.props;
    if (status !== "") {
      contact( Todo, '*', Todo.act.addItem(status) )
      contact( Todo, '*', Todo.act.setInput("") );
      setInputAll("");
    }
  }

  render() {
    const {status, num_items, titles} = this.props;
    return (
      <div>
        <h3>Progress</h3>
        <input type="text" value={status} onChange={(e) => this.handleChangeStatus(e)} />
        <button onClick={() => this.handleAddToAll()}>add to all</button>
        <p>Summary:</p>
        <ul>
          {Object.keys(num_items).map(key => {
            return <li key={key}>{titles[key]}: {num_items[key]} items remaining&nbsp; 
              <button onClick={() => this.handleDone(key)}>done</button>
            </li>;
          })}
        </ul>
        <button onClick={() => this.handleDoneAll()}>done all</button>
      </div>
    );
  }
}

export default conduct(Progress)();
