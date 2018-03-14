import React, { Component } from 'react';
import {connect} from 'react-redux';
import update from 'immutability-helper';
import {get, set, isEqual} from 'lodash';

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

function wrapMapStateToProps(mapStateToProps, RawComponent) {

  const wrappedMapStateToProps = (state, own_props) => {

    let ref_count = 0;

    const conget = (_container, _instance, _path) => {

      const cname = _container.cname || _container.name;

      const ref = {
        _ref: true,
        _container: cname,
        _instance,
        _path
      };
      
      ref_count++;
      
      return ref;

    }

    const original = mapStateToProps(state, own_props, conget);

    // find ref paths
    const refs = [];
    let missing_refs = 0;

    // refs now stores metadata for all referenced state
    if (ref_count > 0) {

      const getRef = (_container, _instance, _path) => {
        let container_props;
        if (_instance) {
          if (_instance === "*") {
            container_props = get(state, ['Container', _container], []);
            if (_path) {
              container_props = Object.keys(container_props).reduce((con_props, _inst) => {
                const res = get(container_props[_inst], _path, null);
                if (res !== undefined) {
                  if (con_props === null) {
                    con_props = {};
                  }
                  con_props[_inst] = res;
                }
                return con_props;
              }, null);
            }
          } else if (Array.isArray(_instance)) {
            container_props = {} 
            _instance.forEach(_inst => {
              container_props[_inst] = 
                _path
                ? get(state, ['Container', _container, _inst].concat(_path), null)
                : get(state, ['Container', cname, _inst], null);
              if (container_props[_inst] === undefined) {
                console.error(`${_container}.${_inst} is not defined`);
              }
            });
          } else {
            container_props = 
              _path
              ? get(state, ['Container', _container, _instance].concat(_path), null)
              : get(state, ['Container', cname, _instance], null);
          }
        } else {
          container_props = get(state, ['Container', _container], []);
        }

        // check for chained references

        return container_props;
      }

      const findPaths = (obj, path = "") => {

        if (obj === null || typeof obj !== 'object') {
          return;
        }

        Object.keys(obj).forEach(key => {
          const new_path = path ? path + "." + key : key;
          const curr = obj[key];
          if (curr && curr._ref === true) {
            const props = getRef(curr._container, curr._instance, curr._path);
            if (props === null) {
              missing_refs++;
            } else {
              refs.push({
                path: new_path,
                props
              });
            }
          } else {
            findPaths(curr, new_path);
          }
        });
      }

      // console.log("findPaths:", own_props.instance);
      findPaths(original);

    }

    const {instance} = own_props;
    const props = get(state, ['Container', RawComponent.name, instance]) || original;

    return {
      key: instance,
      original,
      RawComponent,
      _refs: refs,
      _ref_count: ref_count,
      _missing_refs: missing_refs,
      ...props,
    }
  }

  return wrappedMapStateToProps;

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

const setPathObj = (path, value) => {
  const pathArr = path.split(".");
  const pathObj = {};
  let curr = pathObj;
  while (pathArr) {
    const key = pathArr.shift();
    if (pathArr.length > 0) {
      curr[key] = {};
      curr = curr[key];
    } else {
      curr[key] = {$set: value};
      return pathObj;
    }
  }
}

class Wrapper extends Component {

  constructor(props) {
    super(props);
    const {init, instance, original} = this.props;
    init(original);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    const {
      instance,
      RawComponent,
      init: _0,
      original: _1,
      _refs = [],
      _ref_count = 0,
      _missing_refs = 0,
      act,
      ...props
    } = this.props;

    if (!instance) {
      console.error("instance prop was not given to", RawComponent.name);
      return null;
    }

    if (_missing_refs > 0) {
      return null;
    }

    const props_with_refs = _refs.reduce((_props, _ref) => {
      // console.log("inject", _ref.path);
      return update(
        _props,
        setPathObj(_ref.path, _ref.props)
      )
    }, props);

    // console.log("render:", `${RawComponent.name}.${instance}`);
    return <RawComponent instance={instance} {...act} {...props_with_refs} />;
  }
}

function conduct(mapStateToProps, mapActToProps) {
  return function(RawComponent) {
    const wrappedMapStateToProps = wrapMapStateToProps(mapStateToProps, RawComponent);
    const wrappedMapDispatchToProps = wrapDispatchToProps(mapActToProps, RawComponent);
    const WrappedComponent = connect(wrappedMapStateToProps, wrappedMapDispatchToProps)(Wrapper);
    WrappedComponent.cname = RawComponent;
    return WrappedComponent;
  }
}

module.exports = {
  conduct,
  Container: ContainerReducer
};