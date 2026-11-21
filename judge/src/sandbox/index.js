"use strict";

const cfg = require("../config");

const { DockerSandbox } = require("./docker");
const { IsolateSandbox } = require("./isolate");
const { LocalSandbox } = require("./local");

function createSandbox(boxId) {
  switch (cfg.sandbox) {
    case "docker":
      return new DockerSandbox(boxId);

    case "isolate":
      return new IsolateSandbox(boxId);

    case "local":
      return new LocalSandbox(boxId);

    default:
      throw new Error(`Unknown SANDBOX "${cfg.sandbox}"`);
  }
}

module.exports = { createSandbox };
