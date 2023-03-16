import React from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import LocalDimmingComponent from "./LocalDimmingComponent";

export class LocalDimmingWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_component"}>
        <LocalDimmingComponent />
      </div>
    );
  }
}

export default LocalDimmingWidget;
