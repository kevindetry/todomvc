import React from "react";
import { connect } from "react-redux";

import Checkbox from "material-ui/Checkbox";
import Divider from "material-ui/Divider";
import Grid from "material-ui/Grid";
import IconButton from "material-ui/IconButton";
import Input from "material-ui/Input";
import List, { ListItem, ListItemText } from "material-ui/List";
import Paper from "material-ui/Paper";
import Reboot from "material-ui/Reboot";
import { withStyles } from "material-ui/styles";

import AddIcon from "material-ui-icons/Add";
import DoneIcon from "material-ui-icons/Done";
import EditIcon from "material-ui-icons/ModeEdit";
import RemoveIcon from "material-ui-icons/Remove";

import flatMap from "lodash/flatMap";
import flowRight from "lodash/flowRight";
import mapValues from "lodash/mapValues";
import pick from "lodash/pick";

import actions from "./actions";

const ENTER_KEY_CODE = 13;

const actionMapper = (actionMap, actions) => (dispatch) => ({
  actions: mapValues(
    pick(
      actionMap,
      flatMap(actions, (action) => [`${action}.request`, `${action}.discard`]),
    ),
    (value) =>
      mapValues(value, (action) => (payload, meta) =>
        dispatch(action(payload, meta)),
      ),
  ),
});

const Todo = flowRight(
  connect(
    (state, { id }) => ({ data: state.todos.byId[id] }),
    actionMapper(actions, ["removeTodo", "updateTodo"]),
  ),
  withStyles({
    hiddenIcon: {
      visibility: "hidden",
    },
    inputMargin: {
      margin: "0 16px",
    },
    strikethroughText: {
      textDecoration: "line-through",
    },
  }),
)(
  class Todo extends React.Component {
    state = {
      editable: false,
      modifiedText: null,
      hovered: false,
    };

    updateTodo = () => {
      const modifiedText = this.state.modifiedText.trim();
      if (modifiedText) {
        const { actions: { updateTodo }, data: { id, text } } = this.props;
        if (modifiedText !== text)
          updateTodo.request({ id, text: modifiedText });
        else this.setState({ editable: false, modifiedText: null });
      }
    };

    handleCheckboxChange = ({ target: { checked } }) => {
      const { actions: { updateTodo }, data: { id } } = this.props;
      updateTodo.request({ id, completed: checked });
    };

    handleInputChange = ({ target: { value } }) => {
      this.setState({ modifiedText: value });
    };

    handleDeleteButtonClick = () => {
      const { actions: { removeTodo }, id } = this.props;
      removeTodo.request({ id });
    };

    handleEditButtonClick = () => {
      const { data: { text } } = this.props;
      this.setState({ editable: true, modifiedText: text });
    };

    handleKeyDown = ({ keyCode }) => {
      if (keyCode === ENTER_KEY_CODE) this.updateTodo();
    };

    handleMouseOver = () => {
      this.setState({ hovered: true });
    };

    handleMouseOut = () => {
      this.setState({ hovered: false });
    };

    componentWillReceiveProps() {
      this.setState({ editable: false, modifiedText: null });
    }

    render() {
      const { editable, modifiedText, hovered } = this.state;
      const {
        classes: { hiddenIcon, inputMargin, strikethroughText },
        data: { completed, text },
      } = this.props;

      return (
        <ListItem
          onMouseOver={!editable ? this.handleMouseOver : undefined}
          onMouseOut={!editable ? this.handleMouseOut : undefined}
        >
          <Checkbox onChange={this.handleCheckboxChange} />
          {editable ? (
            <Input
              autoFocus
              classes={{ root: inputMargin }}
              fullWidth
              onChange={this.handleInputChange}
              onKeyDown={this.handleKeyDown}
              value={modifiedText}
            />
          ) : (
            <ListItemText
              classes={{ primary: completed && strikethroughText }}
              primary={text}
            />
          )}
          <IconButton
            classes={{ root: !hovered && hiddenIcon }}
            onClick={editable ? this.updateTodo : this.handleEditButtonClick}
          >
            {editable ? <DoneIcon /> : <EditIcon />}
          </IconButton>
          <IconButton
            classes={{ root: !hovered && hiddenIcon }}
            onClick={this.handleDeleteButtonClick}
          >
            <RemoveIcon />
          </IconButton>
        </ListItem>
      );
    }
  },
);

export default flowRight(
  connect(
    (state) => ({ ids: [...state.todos.allIds].reverse() }),
    actionMapper(actions, ["createTodo", "obtainTodoList"]),
  ),
  withStyles({
    root: {
      margin: "2rem 0",
    },
  }),
)(
  class App extends React.Component {
    state = {
      text: "",
    };

    componentWillReceiveProps() {
      this.setState({ text: "" });
    }

    componentDidMount() {
      const { actions: { obtainTodoList } } = this.props;
      obtainTodoList.request();
    }

    createTodo = () => {
      const text = this.state.text.trim();
      if (text) {
        const { actions: { createTodo } } = this.props;
        createTodo.request({ text });
      }
    };

    handleChange = ({ target: { value } }) => {
      this.setState({ text: value });
    };

    handleKeyDown = ({ keyCode }) => {
      if (keyCode === ENTER_KEY_CODE) this.createTodo();
    };

    render() {
      const { text } = this.state;
      const { classes: { root }, ids } = this.props;

      return (
        <React.Fragment>
          <Reboot />
          <Grid
            alignContent="center"
            alignItems="center"
            className={root}
            container
            justify="center"
            spacing={0}
          >
            <Grid item xs={10} md={8} lg={6} xl={4}>
              <List>
                <Paper>
                  <ListItem>
                    <Input
                      autoFocus
                      fullWidth
                      placeholder="What needs to be done?"
                      value={text}
                      onChange={this.handleChange}
                      onKeyDown={this.handleKeyDown}
                    />
                    <IconButton onClick={this.createTodo}>
                      <AddIcon />
                    </IconButton>
                  </ListItem>
                  {ids.map((id) => (
                    <React.Fragment key={id}>
                      <Divider />
                      <Todo id={id} />
                    </React.Fragment>
                  ))}
                </Paper>
              </List>
            </Grid>
          </Grid>
        </React.Fragment>
      );
    }
  },
);
