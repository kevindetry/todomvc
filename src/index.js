import React from "react";
import { render } from "react-dom";
import { applyMiddleware, compose, createStore } from "redux";
import { Provider } from "react-redux";
import { createEpicMiddleware } from "redux-observable";

import "typeface-roboto";

import App from "./App";
import rootEpic from "./epics";
import rootReducer from "./reducers";
import registerServiceWorker from "./registerServiceWorker";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const epicMiddleware = createEpicMiddleware(rootEpic);

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(epicMiddleware)),
);

const AppWithStore = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

const rootElement = document.getElementById("root");

render(<AppWithStore />, rootElement);

if (process.env.NODE_ENV !== "production" && module.hot) {
  module.hot.accept("./App", () => {
    render(<AppWithStore />, rootElement);
  });
  module.hot.accept("./reducers", () => {
    store.replaceReducer(rootReducer);
  });
  // module.hot.accept("./epics", () => {
  //   epicMiddleware.replaceEpic(rootEpic);
  // });
}

registerServiceWorker();
