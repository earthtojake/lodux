import React, { Component } from 'react';
import Todo from './Todo';
import Progress from './Progress';

class App extends Component {

  render() {
    const {data} = this.props;
    return (
      <div>
        <h1>Todos</h1>
        <Todo instance="shopping_list" items={['apples', 'pears', 'oranges']}/>
        <Todo instance="homework" items={['math', 'physics', 'chemistry']}/>
        <h1>Summary</h1>
        <Progress instance="todo_progress" />
      </div>
    );
  }
}

export default App;
