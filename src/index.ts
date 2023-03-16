import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { WidgetTracker } from "@jupyterlab/apputils";

import { ILauncher } from "@jupyterlab/launcher";

import { WebDSService, WebDSWidget } from "@webds/service";

import { localDimmingIcon } from "./icons";

import LocalDimmingWidget from "./widget/LocalDimmingWidget";

namespace Attributes {
  export const command = "webds_local_dimming:open";
  export const id = "webds_local_dimming_widget";
  export const label = "Local Dimming";
  export const caption = "Local Dimming";
  export const category = "Device - Assessment";
  export const rank = 80;
}

export let webdsService: WebDSService;

/**
 * Initialization data for the @webds/local_dimming extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "@webds/local_dimming:plugin",
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService
  ) => {
    console.log("JupyterLab extension @webds/local_dimming is activated!");

    webdsService = service;

    let widget: WebDSWidget;
    const { commands, shell } = app;
    const command = Attributes.command;
    commands.addCommand(command, {
      label: Attributes.label,
      caption: Attributes.caption,
      icon: (args: { [x: string]: any }) => {
        return args["isLauncher"] ? localDimmingIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new LocalDimmingWidget(Attributes.id);
          widget = new WebDSWidget<LocalDimmingWidget>({ content });
          widget.id = Attributes.id;
          widget.title.label = Attributes.label;
          widget.title.icon = localDimmingIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, "main");

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: Attributes.category,
      rank: Attributes.rank
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: Attributes.id
    });
    restorer.restore(tracker, {
      command,
      name: () => Attributes.id
    });
  }
};

export default plugin;
