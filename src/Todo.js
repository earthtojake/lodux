import React, { Component } from 'react';
import {conduct} from '../redact';

class Todo extends Component {

  handleAddItem() {
    const {input, addItem, setInput} = this.props;
    if (input !== "") {
      addItem(input);
      setInput("");
    }
  }

  handleRemoveItem(index) {
    const {removeItem} = this.props;
    removeItem(index);
  }

  handleChangeItem(e, index) {
    const {setItem} = this.props;
    setItem(index, e.target.value);
  }

  handleChangeInput(e) {
    const {setInput} = this.props;
    setInput(e.target.value);
  }

  render() {
    const {instance, items, input} = this.props;
    return (
      <div>
        <h3>{instance}</h3>
        <ul>
          {items.map((item, i) =>
            <li key={i}>
              <input type="text" value={item} onChange={(e) => this.handleChangeItem(e, i)}/>
              &nbsp;
              <button onClick={() => this.handleRemoveItem(i)}>x</button>
            </li>
          )}
        </ul>
        <input type="text" value={input} onChange={(e) => this.handleChangeInput(e)} />
        <button onClick={() => this.handleAddItem()}>Add</button>
      </div>
    );
  }
}

// returns data to be initialized for this container and regular props from state
// path = ContainerReducer.${container.name}.${instance}
const mapStateToProps = (state, own_props, conget) => {
  const {items = []} = own_props;
  return {
    items,
    input: ""
  };
}

// CRUD wrapper functions
export const empty = {
  items: {
    $set: []
  }
};

export const addItem = (item) => ({
  items: {
    $push: [item]
  }
});

export const removeItem = (index) => ({
  items: {
    $splice: [[index, 1]]
  }
});

export const setItem = (index, value) => ({
  items: {
    [index]: {
      $set: value
    }
  }
});

export const setInput = (value) => ({
  input: {$set: value}
})

// act = dispatch action on self
// contact = dispatch action on an instance of another container
const mapActToProps = (own_props, act, contact) => {
  return {
    setInput: (value) => act( setInput(value) ),
    addItem: (item) => act( addItem(item) ),
    removeItem: (index) => act( removeItem(index) ),
    setItem: (index, value) => act( setItem(index, value) ),
    empty: () => act( empty )
  }
}

export default conduct(mapStateToProps, mapActToProps)(Todo);
