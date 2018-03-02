import React, { Component } from 'react';
import {connect} from './lodux';

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

  render() {
    const {data} = this.props;
    return (
      <div>Todos:
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
      </div>
    );
  }
}

const mapDataToProps = (own_props) => {
  return {
    items: ["one", "two", "three"]
  };
}

const mapActToProps = (act, own_props) => {
  return {
    addItem: (item) => {
      act( {path: 'items', cmd: {$push: [item]}} );
    },
    removeItem: (index) => {
      act( {path: 'items', cmd: {$splice: [[index, 1]]} });
    },
    setItem: (index, value) => {
      act( {path: `items.${index}`, cmd: {$set: value}} );
    }
  }
}

export default connect(mapDataToProps, mapActToProps)(Todo);
