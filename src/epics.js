import { combineEpics, ofType } from "redux-observable";
import { normalize, schema } from "normalizr";

import { ajax } from "rxjs/observable/dom/ajax";
import { of } from "rxjs/observable/of";

import { catchError } from "rxjs/operators/catchError";
import { map } from "rxjs/operators/map";
import { mergeMap } from "rxjs/operators/mergeMap";
import { takeUntil } from "rxjs/operators/takeUntil";

import actions from "./actions";

const { obtainTodoList, createTodo, updateTodo, removeTodo } = actions;

const API_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

const createEpic = ({
  action,
  requestTransformer,
  responseTransformer = ({ response }) => response,
}) => (action$) =>
  action$.pipe(
    ofType(action.request),
    mergeMap(({ payload, meta }) =>
      ajax(requestTransformer(payload, meta)).pipe(
        map((response) =>
          action.success(responseTransformer(response, payload, meta)),
        ),
        catchError((error) => of(action.failure(error))),
        takeUntil(action$.ofType(action.discard)),
      ),
    ),
  );

const todoSchema = new schema.Entity("todos");
const todoListSchema = [todoSchema];

const obtainTodoListEpic = createEpic({
  action: obtainTodoList,
  requestTransformer: () => ({ url: `${API_URL}/todos` }),
  responseTransformer: ({ response }) => {
    const normalizedResponse = normalize(response, todoListSchema);
    return {
      allIds: normalizedResponse.result,
      byId: normalizedResponse.entities.todos,
    };
  },
});

const createTodoEpic = createEpic({
  action: createTodo,
  requestTransformer: ({ text }) => ({
    url: `${API_URL}/todos`,
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: {
      completed: false,
      text,
    },
  }),
});

const updateTodoEpic = createEpic({
  action: updateTodo,
  requestTransformer: ({ id, ...payload }) => ({
    method: "PATCH",
    url: `${API_URL}/todos/${id}`,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: payload,
  }),
});

const removeTodoEpic = createEpic({
  action: removeTodo,
  requestTransformer: ({ id }) => ({
    method: "DELETE",
    url: `${API_URL}/todos/${id}`,
  }),
  responseTransformer: (response, { id }) => ({ id }),
});

export default combineEpics(
  obtainTodoListEpic,
  createTodoEpic,
  updateTodoEpic,
  removeTodoEpic,
);
