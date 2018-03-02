import React, { Component } from 'react';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {get} from 'lodash';

const INIT = 'INIT_DATA';
const UPDATE = 'UPDATE';

const updateData = (action) => {
  return {
    type: UPDATE,
    ...action
  }
}

const initData = (container, key, data) => {
  return {
    type: INIT,
    container,
    key,
    data
  }
}

function updateWithPath(state, path, action) {
  const pathObj = {};
  let curr = pathObj;
  while (path.length > 0) {
    const prop = path.shift();
    if (path.length === 0) {
      curr[prop] = action;
    } else {
      curr[prop] = {};
    }
    curr = curr[prop];
  }
  return update(state, pathObj);
}

const ContainerReducer = function(state = {}, action) {
  switch (action.type) {
    case UPDATE:
      let action_path = action.path || [];
      if (typeof action_path === 'string') {
        action_path = action_path.split('.');
      }
      const path = [action.container, action.key, ...action_path];
      console.log(action);
      return updateWithPath(state, path, action.cmd);
    case INIT:
      return {
        ...state,
        [action.container]: {
          ...state[action.container],
          [action.key]: action.data,
        }
      }
    default:
      return state;
  }
}

function wrapMapStateToProps(mapStateToProps, RawComponent) {
  return (state, own_props) => {
    const {data, props} = mapStateToProps(state, own_props);
    const {instance} = own_props;
    return {
      key: instance,
      data: get(state, ['ContainerReducer', RawComponent.name, instance]) || data,
      original: data,
      RawComponent,
      ...props
    }
  }
}

function wrapMapDispatchToProps(mapActToProps, RawComponent) {
  return (dispatch, own_props) => {

    const {instance} = own_props;
    const key = instance;

    if (!instance) {
      console.error("instance prop was not passed into",RawComponent.name);
    }

    const container_name = RawComponent.name;

    const act = action_def => {
      const wrapped_def = {container: container_name, key, ...action_def};
      dispatch(updateData(wrapped_def));
    }

    const contact = (other_container, other_key, action_def) => {
      const wrapped_def = {container: other_container.name, key: other_key, ...action_def};
      dispatch(updateData(wrapped_def));
    }

    const actors = mapActToProps(act, contact, own_props);
    
    return {
      init: (_data) => {
        dispatch(initData(container_name, key, _data));
      },
      ...actors
    }

  }
}

class Wrapper extends Component {
  componentDidMount() {
    const {init, RawComponent, original} = this.props;
    init(original);
  }
  render() {
    const {RawComponent, init: _, ...props} = this.props;
    return <RawComponent {...props} />;
  }
}

function conduct(mapStateToProps, mapActToProps) {
  return function(RawComponent) {
    const wrappedMapStateToProps = wrapMapStateToProps(mapStateToProps, RawComponent);
    const wrappedMapDispatchToProps = wrapMapDispatchToProps(mapActToProps, RawComponent);
    return connect(wrappedMapStateToProps, wrappedMapDispatchToProps)(Wrapper);
  }
}
  
module.exports = {
  conduct,
  ContainerReducer
};