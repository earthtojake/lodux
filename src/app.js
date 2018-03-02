import React, { Component } from 'react';
import Todo from './Todo';

class App extends Component {

  render() {
    const {data} = this.props;
    return (
      <div>
        <Todo instance="shopping_list"/>
        <br />
        <Todo instance="homework"/>
      </div>
    );
  }
}

export default App;
