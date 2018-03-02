import React, { Component } from 'react';
import {conduct} from './lodux';

class Todo extends Component {

  constructor(props) {
    super(props);
    this.state = {todo: ""};
  }

  handleAddItem() {
    const {addItem} = this.props;
    if (this.state.todo !== "") {
      addItem(this.state.todo);
      this.setState({todo: ""});
    }
  }

  handleRemoveItem(index) {
    const {removeItem} = this.props;
    removeItem(index);
  }

  changeItem(e, index) {
    const {setItem} = this.props;
    setItem(index, e.target.value);
  }

  handleAddToAll() {
    const {addToAll} = this.props;
    if (this.state.todo !== "") {
      addToAll(this.state.todo);
      this.setState({todo: ""});
    }
  }

  render() {
    const {instance, items} = this.props;
    return (
      <div>
        <p>Instance {instance} of Todo</p>
        <ul>
          {items.map((item, i) =>
            <li key={i}>
              <input type="text" value={item} onChange={(e) => this.changeItem(e, i)}/>
              &nbsp;
              <button onClick={() => this.handleRemoveItem(i)}>x</button>
            </li>
          )}
        </ul>
        <input type="text" value={this.state.todo} onChange={(e) => this.setState({todo: e.target.value})} />
        <button onClick={() => this.handleAddItem()}>Add</button>
        <button onClick={() => this.handleAddToAll()}>Add to all</button>
      </div>
    );
  }
}

// returns data to be initialized for this container and regular props from state
// path = ContainerReducer.${container.name}.${instance}
const mapStateToProps = (state, own_props) => {
  const {items = []} = own_props;
  return {
    items
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

// act = dispatch action on self
// contact = dispatch action on an instance of another container
const mapActToProps = (own_props, act, contact) => {
  return {
    addItem: (item) => {
      act( addItem(item) );
    },
    removeItem: (index) => {
      act( removeItem(index) );
    },
    setItem: (index, value) => {
      act( setItem(index, value) );
    },
    empty: () => {
      act( empty );
    },
    addToAll: (item) => {
      // dispatch action on two instances of Todo
      contact( Todo, ['shopping_list', 'homework'], addItem(item) );
    }
  }
}

export default conduct(mapStateToProps, mapActToProps)(Todo);
