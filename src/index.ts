#!/usr/bin/env node
"use strict";

import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import { exec, ExecException } from "child_process";
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
    alias: "s",
    description: "This is the ID scope of the Device Provisioning Service",
    type: "string",
    default: process.env.DEVICE_ID_SCOPE,
  })
  .option("modelId", {
    alias: "m",
    description: "The is the Interface @Id of the Device template",
    type: "string",
    default: process.env.DEVICE_MODEL_ID,
  })
  .option("interval", {
    alias: "i",
    description: "The interval of how often a message will be sent (in seconds)",
    type: "number",
    default: 10,
  })
  .option("quiet", {
    type: "boolean",
    alias: "q",
    description: "Suppress output",
    conflicts: "verbose",
  })
  .demandOption("deviceId")
  .help();

async function asyncMain(): Promise<void> {
  if (!argv.idScope) {
    log("No ID scope set. You must set it with the -i option or create a .env file.");
    return;
  }

  if (!argv.modelId) {
    log("No model ID set. You must set it with the -m option or create a .env file.");
    return;
  }

  if (argv.deviceKey) {
    startSimulator(argv.deviceKey);
  } else {
    if (!process.env.DEVICE_GROUP_KEY) {
      log("No device group key set. You must create a .env file with a DEVICE_GROUP_KEY variable.");
      return;
    }

    const deviceKey = await generateDeviceKey(argv.deviceId);

    startSimulator(deviceKey);
  }
}

function startSimulator(deviceKey: string): void {
  const iotDevice = new IoTCentralDevice(log, argv.deviceId, argv.idScope, deviceKey, argv.modelId);

  const simulator = new Simulator(log, iotDevice, argv.interval);

  simulator.run();
}

function log(message: string): void {
  // eslint-disable-next-line no-console
  if (!argv.quiet) console.log(message);
}

function generateDeviceKey(deviceId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      `az iot central device compute-device-key --primary-key ${process.env.DEVICE_GROUP_KEY} --device-id ${deviceId}`,
      function (error: ExecException | null, stdout: string, stderr: string): void {
        if (error) {
          throw error;
        } else if (stderr) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      },
    );
  });
}

asyncMain().catch((err: any): void => {
  console.log("error code: ", err.code);
  console.log("error message: ", err.message);
  console.log("error stack: ", err.stack);
});
