import snakeCase from "lodash/snakeCase";
import upperFirst from "lodash/upperFirst";

const create = "create";
const obtain = "obtain";
const update = "update";
const remove = "remove";

const createAction = ({ actionType, entity, status }) => {
  const type = (actionType ? actionType.toUpperCase().concat("_") : "")
    .concat(snakeCase(entity).toUpperCase())
    .concat(status ? ".".concat(status.toUpperCase()) : "");
  const action = (payload, meta) => {
    const result = { type };
    if (payload) result.payload = payload;
    if (meta) result.meta = meta;
    return result;
  };
  action.toString = () => type;
  return action;
};

const createActionsWithStatus = ({ actionType, entity }) =>
  ["request", "discard", "success", "failure"].reduce(
    (result, status) => ({
      ...result,
      [status]: createAction({ actionType, entity, status }),
    }),
    {},
  );

const createActions = (actionMap) => {
  const result = {};
  for (const entity in actionMap) {
    if (Array.isArray(actionMap[entity])) {
      for (const actionType of actionMap[entity]) {
        result[actionType.concat(upperFirst(entity))] = createActionsWithStatus(
          {
            actionType,
            entity,
          },
        );
      }
    } else {
      result[entity] = actionMap[entity]
        ? createActionsWithStatus({ entity })
        : createAction({ entity });
    }
  }
  return result;
};

export default createActions({
  todo: [create, update, remove],
  todoList: [obtain],
});
