import React, { Component } from 'react';
import {conduct, Container} from '../redact';

class Todo extends Container {

  static act = {
    setInput: (value) => ({
      input: {$set: value}
    }),
    addItem: (item) => ({
      items: {$push: [item]}
    }),
    removeItem: (index) => ({
      items: {$splice: [[index, 1]]}
    }),
    setItem: (value, index) => ({
      items: { [index]: { $set: value } }
    }),
    setTitle: (value) =>  ({
      title: { $set: value }
    }),
    empty: {
      items: { $set: [] }
    }
  }

  static injectProps(store) {
    const {items = [], instance: title} = this.props;
    return {
      items,
      input: "",
      title,
    };
  }

  handleAddItem() {
    const {input, addItem, setInput} = this.props;
    if (input !== "") {
      addItem(input);
      setInput("");
    }
  }

  render() {

    const {
      instance, 
      items, 
      input, 
      title, 
      setTitle,
      removeItem,
      setItem,
      setInput,
    } = this.props;

    return (
      <div>
        <h3>
          Title: 
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </h3>
        <ul>
          {items.map((item, i) =>
            <li key={i}>
              <input type="text" value={item} onChange={(e) => setItem(e.target.value, i)}/>
              &nbsp;
              <button onClick={() => removeItem(i)}>x</button>
            </li>
          )}
        </ul>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={() => this.handleAddItem()}>Add</button>
      </div>
    );
  }
}

export default conduct(Todo)();
