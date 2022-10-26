#!/usr/bin/env node
"use strict";

import { IoTCentralDevice } from "./device";
import { Simulator } from "./simulator";

const { argv } = require("yargs")
  .option("deviceId", {
    alias: "d",
    description: "This is a unique ID of the simulated device",
    type: "string",
  })
  .option("deviceKey", {
    alias: "k",
    description: "The is the Primary key of the Shared access signature of a Device connection group",
    type: "string",
  })
  .option("idScope", {
    alias: "i",
    description: "This is the ID scope of the Device Provisioning Service",
    type: "string",
  })
  .option("modelId", {
    alias: "m",
    description: "The is the Interface @Id of the Device template",
    type: "string",
    default: "dtmi:azureiot:iv2go_device;1",
  })
  .option("quiet", {
    type: "boolean",
    alias: "q",
    description: "Suppress output",
    conflicts: "verbose",
  })
  .demandOption("deviceId")
  .demandOption("deviceKey")
  .demandOption("idScope")
  .help();

async function asyncMain(): Promise<void> {
  const iotDevice = new IoTCentralDevice(
    log,
    argv.deviceId,
    argv.idScope,
    argv.deviceKey,
    argv.modelId
  );

  const simulator = new Simulator(log, iotDevice);

  simulator.run();
}

function log(message: any): void {
  // eslint-disable-next-line no-console
  if (!argv.quiet) console.log(message);
}

asyncMain().catch((err: any): void => {
  console.log("error code: ", err.code);
  console.log("error message: ", err.message);
  console.log("error stack: ", err.stack);
});
