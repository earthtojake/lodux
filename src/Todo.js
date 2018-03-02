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
    const {id, data} = this.props;
    return (
      <div>
        <p>{id}</p>
        <ul>
          {data.items.map((item, i) =>
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

const mapDataToProps = (own_props) => {
  const {id} = own_props;
  return {
    key: id,
    data: {
      items: ["one", "two", "three"]
    }
  };
}

const mapActToProps = (act, contact, own_props) => {
  return {
    addItem: (item) => {
      act( {path: 'items', cmd: {$push: [item]}} );
    },
    removeItem: (index) => {
      act( {path: 'items', cmd: {$splice: [[index, 1]]} });
    },
    setItem: (index, value) => {
      act( {path: `items.${index}`, cmd: {$set: value}} );
    },
    addToAll: (item) => {
      // talk to any container store by passing in the container and key
      contact( Todo, 'shopping_list', {path: 'items', cmd: {$push: [item]}} );
      contact( Todo, 'homework', {path: 'items', cmd: {$push: [item]}} );
    }
  }
}

export default conduct(mapDataToProps, mapActToProps)(Todo);
