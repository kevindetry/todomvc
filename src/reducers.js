import { combineReducers } from "redux";

import omit from "lodash/omit";

import actions from "./actions";

const { obtainTodoList, createTodo, updateTodo, removeTodo } = actions;

const handleActions = (actionHandlerMap, initState) => (
  state = initState,
  { type, payload, meta },
) =>
  type in actionHandlerMap
    ? actionHandlerMap[type](state, payload, meta)
    : state;

const todos = handleActions(
  {
    [createTodo.success]: (state, payload) => ({
      ...state,
      allIds: state.allIds.concat(payload.id),
      byId: { ...state.byId, [payload.id]: payload },
      error: null,
    }),
    [createTodo.failure]: (state, error) => ({
      ...state,
      error,
    }),

    [removeTodo.success]: (state, payload) => ({
      ...state,
      allIds: state.allIds.filter((id) => id !== payload.id),
      byId: omit(state.byId, payload.id),
      error: null,
    }),
    [removeTodo.failure]: (state, error) => ({
      ...state,
      error,
    }),

    [updateTodo.success]: (state, payload) => ({
      ...state,
      byId: { ...state.byId, [payload.id]: payload },
      error: null,
    }),
    [updateTodo.failure]: (state, error) => ({
      ...state,
      error,
    }),

    [obtainTodoList.request]: (state) => ({
      ...state,
      error: null,
      loading: true,
    }),
    [obtainTodoList.discard]: (state) => ({ ...state, loading: false }),
    [obtainTodoList.success]: (state, payload) => ({
      ...state,
      ...payload,
      loading: false,
    }),
    [obtainTodoList.failure]: (state, error) => ({
      ...state,
      error,
      loading: false,
    }),
  },
  {
    allIds: [],
    byId: {},
    error: null,
    loading: false,
  },
);

export default combineReducers({ todos });
