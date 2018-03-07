import React, { Component } from 'react';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {get, isEqual} from 'lodash';

const INIT = 'INIT_DATA';
const UPDATE_ONE = 'UPDATE_ONE';
const UPDATE_MANY = 'UPDATE_MANY';
const UPDATE_ALL = 'UPDATE_ALL';

const updateOne = (action) => {
  return {
    type: UPDATE_ONE,
    ...action
  }
}

const updateAll = (action) => {
  return {
    type: UPDATE_ALL,
    ...action
  }
}

const updateMany = (action) => {
  return {
    type: UPDATE_MANY,
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

  let action_path = action.path || [];
    if (typeof action_path === 'string') {
      action_path = action_path.split('.');
    }
  switch (action.type) {
    case UPDATE_ONE:
      const pathObj = {
        [action.container]: {
          [action.key]: action.update
        }
      };
      return update(state, pathObj);
    case UPDATE_ALL:
      const instances = get(state, [action.container]);
      return Object.keys(instances).reduce((s, key) => {
        const pathObj = {
          [action.container]: {
            [key]: action.update
          }
        };
        return update(s, pathObj);
      }, state);
    case UPDATE_MANY:
      return action.keys.reduce((s, key) => {
        const path = [action.container, key, ...action_path];
        const pathObj = {
          [action.container]: {
            [key]: action.update
          }
        };
        if (get(s, path)) {
          return update(s, pathObj);
        } else {
          return s;
        }
      }, state);
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

const stripUndefined = (obj) => {
  Object.keys(obj).forEach(key => {
    if (!obj[key]) {
      delete obj[key];
    }
  });
  return obj;
}

function wrapMapStateToProps(mapStateToProps, RawComponent) {
  return (state, own_props) => {

    let inject_props = [];

    const conget = (_container, _instance, _path) => {
      const cname = _container.cname || _container.name;

      let full_path = [cname];
      if (_instance) {
        full_path = [cname, _instance];
        if (_path) {
          full_path = [cname, _instance].concat(_path);
        }
      }

      let container_props;
      if (_instance) {
        if (_instance === "*") {
          container_props = get(state, ['ContainerReducer', cname]);
          if (_path) {
            let _container_props = {};
            Object.keys(container_props).forEach(_inst => {
              _container_props[_inst] = get(container_props[_inst], _path);
            });
            container_props = _container_props;
          }
        } else if (Array.isArray(_instance)) {
          container_props = {} 
          _instance.forEach(_inst => {
            container_props[_inst] = _path ? get(state, ['ContainerReducer', cname, _inst].concat(_path)) : get(state, ['ContainerReducer', cname, _inst]);
            if (container_props[_inst] === undefined) {
              console.error(`${cname}.${_inst} is not defined`);
            }
          });
        } else {
          container_props = _path ? get(state, ['ContainerReducer', cname, _instance].concat(_path)) : get(state, ['ContainerReducer', cname, _instance]);
        }
      } else {
        container_props = get(state, ['ContainerReducer', cname]);
      }
      
      if (container_props !== undefined) {
        return {
          _congot: true,
          _path: full_path,
          _instance,
          container_props
        };
      } else {
        return {
          _congot: false,
          _path:full_path,
          _instance
        }
      }
    }

    const original = mapStateToProps(state, own_props, conget);

    const congot = {};
    let congot_failed = false;

    Object.keys(original).forEach(key => {
      const obj = original[key];
      if (typeof obj._congot === 'boolean') {
        if (obj._congot === true) {
          congot[key] = obj;
        } else if (obj._congot === false) {
          congot_failed = true;
        }
        delete original[key];
      }
    });

    const {instance} = own_props;
    const props = get(state, ['ContainerReducer', RawComponent.name, instance]) || original;

    return {
      key: instance,
      original,
      RawComponent,
      _congot_failed: congot_failed,
      _congot: congot,
      ...props,
    }
  }
}

function wrapMapDispatchToProps(mapActToProps, RawComponent) {
  return (dispatch, own_props) => {

    const {instance} = own_props;
    const key = instance;

    const container_name = RawComponent.name;

    const act = action_def => {
      const wrapped_def = {container: container_name, key, update: action_def};
      dispatch(updateOne(wrapped_def));
    }

    const contact = (other_container, other_key, action_def) => {
      const cname = other_container.cname || other_container.name;
      if (other_key === "*") {
        const wrapped_def = {container: cname, update: action_def};
        dispatch(updateAll(wrapped_def));
      } else if (Array.isArray(other_key)) {
        const wrapped_def = {container: cname, keys: other_key, update: action_def};
        dispatch(updateMany(wrapped_def));
      } else {
        const wrapped_def = {container: cname, key: other_key, update: action_def};
        dispatch(updateOne(wrapped_def));
      }
    }

    const actors = mapActToProps(own_props, act, contact);
    
    return {
      init: (_data) => {
        dispatch(initData(container_name, key, _data));
      },
      act: actors
    }

  }
}

class Wrapper extends Component {

  constructor(props) {
    super(props);
    const {init, RawComponent, original} = this.props;
    init(original);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {instance, _congot, ...curr_props} = this.props;
    const {instance: _, _congot: _next_congot, ...next_props} = nextProps;

    const congot_equal = Object.keys(_next_congot).every(key => {
      if (_congot[key] !== undefined) {
        return isEqual(_congot[key], _next_congot[key]);
      } else {
        return false;
      }
    });

    return !isEqual(curr_props, next_props) || !congot_equal;
  }

  render() {
    const {instance, RawComponent, init: _0, original: _1, _congot, _congot_failed, act, ...props} = this.props;
    
    console.log("render:", `${RawComponent.name}.${instance}`);

    if (!instance) {
      console.error("instance prop was not passed into", RawComponent.name);
      return null;
    }

    if (_congot_failed === true) {
      return null;
    }

    const congot = {};
    Object.keys(_congot).forEach(key => {
      congot[key] = _congot[key].container_props;
    })

    return <RawComponent instance={instance} {...act} {...props} {...congot} />;
  }
}

function conduct(mapStateToProps, mapActToProps) {
  return function(RawComponent) {
    const wrappedMapStateToProps = wrapMapStateToProps(mapStateToProps, RawComponent);
    const wrappedMapDispatchToProps = wrapMapDispatchToProps(mapActToProps, RawComponent);
    const WrappedComponent = connect(wrappedMapStateToProps, wrappedMapDispatchToProps)(Wrapper);
    WrappedComponent.cname = RawComponent.name;
    return WrappedComponent;
  }
}
  
module.exports = {
  conduct,
  ContainerReducer
};