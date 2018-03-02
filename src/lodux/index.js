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

const initData = (key, data) => {
  return {
    type: INIT,
    data,
    key
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

const LodashReducer = function(state = {}, action) {
  let action_path = action.path || [];
  if (typeof action_path === 'string') {
    action_path = action_path.split('.');
  }
  switch (action.type) {
    case UPDATE:
      const path = [action.key, 'data', ...action_path];
      return updateWithPath(state, path, action.cmd);
    case INIT:
      return {
        ...state,
        [action.key]: {
          key: action.key,
          data: action.data
        }
      }
    default:
      return state;
  }
}

function wrapMapStateToProps(mapDataToProps, RawComponent) {
  return (state, own_props) => {
    let data = mapDataToProps(own_props) || {};
    const key = genKey(RawComponent, own_props);
    if (state.LodashReducer && state.LodashReducer[key]) {
      data = state.LodashReducer[key].data;
    }
    return {
      data,
      RawComponent
    }
  }
}

const genKey = (component, own_props) => {
  const obj = {
    ...own_props,
    component: component.name
  }
  return JSON.stringify(obj);
}

function wrapMapDispatchToProps(mapDataToProps, mapActToProps, RawComponent) {
  return (dispatch, own_props) => {
    const data = mapDataToProps(own_props) || {};
    const key = genKey(RawComponent, own_props);
    const dispact = action_def => {
      const wrapped_def = {key, ...action_def};
      dispatch(updateData(wrapped_def));
    }

    const dispatchers = mapActToProps(dispact, own_props);
    
    return {
      init: data => {
        dispatch(initData(key, data));
      },
      ...dispatchers
    }

  }
}

class Wrapper extends Component {
  componentDidMount() {
    const {init, data} = this.props;
    init(data);
  }
  render() {
    const {RawComponent, init: _, ...props} = this.props;
    return <RawComponent {...props} />;
  }
}

function connectWithLodux(mapDataToProps, mapActToProps) {
  return function(RawComponent) {
    const wrappedMapStateToProps = wrapMapStateToProps(mapDataToProps, RawComponent);
    const wrappedMapDispatchToProps = wrapMapDispatchToProps(mapDataToProps, mapActToProps, RawComponent);
    return connect(wrappedMapStateToProps, wrappedMapDispatchToProps)(Wrapper);
  }
}
  
module.exports = {
  connect: connectWithLodux,
  LodashReducer
};