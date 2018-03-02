import React, { Component } from 'react';
import Todo from './Todo';
import Progress from './Progress';

class App extends Component {

  render() {
    const {data} = this.props;
    return (
      <div>
        <h2>Todos</h2>
        <Todo instance="shopping_list" items={['apples', 'pears', 'oranges']}/>
        <br />
        <Todo instance="homework" items={['math', 'physics']}/>
        <br />
        <Progress instance="todo_progress" />
      </div>
    );
  }
}

export default App;
