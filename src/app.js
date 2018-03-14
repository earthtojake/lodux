import React, { Component } from 'react';
import Todo from './Todo';
import Progress from './Progress';

class App extends Component {

  render() {
    const {data} = this.props;

    return (
      <div>
        <Progress instance="progress" />
        <Todo instance="homework" items={['math', 'physics', 'english']}/>
        <Todo instance="groceries" items={['apple', 'orange', 'mango']} />
      </div>
    );
  }
}

export default App;
