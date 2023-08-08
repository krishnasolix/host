import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { useSelector } from "react-redux";

// Module Federation - importing this from application 2
const Card = React.lazy(() =>
  // @ts-ignore
  import("remote/Card").then((module) => {
    return {
      default: module.Card || (() => <div>Contact sales</div>),
    };
  })
);

const MainApp = React.lazy(() =>
  // @ts-ignore
  import("remote/MainApp").then((module) => {
    debugger;
    return {
      default: module.default || (() => <div>Contact sales</div>),
    };
  })
);

function App({ store }) {
  const data = useSelector((state) => {
    return state;
  });
  return (
    <div className="App">
      <header className="App-header">
        <div>This is the host application.</div>
        <div style={{ margin: 20 }}>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Card />
          </React.Suspense>
        </div>
      </header>
      <React.Suspense fallback={<div>Loading...</div>}>
        <MainApp store={store}></MainApp>
      </React.Suspense>
    </div>
  );
}

export default App;
