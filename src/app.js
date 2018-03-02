import React, { Component } from 'react';
import Todo from './Todo';

class App extends Component {

  render() {
    const {data} = this.props;
    return (
      <div>
        <Todo id="shopping_list"/>
        <br />
        <Todo id="homework"/>
      </div>
    );
  }
}

export default App;
