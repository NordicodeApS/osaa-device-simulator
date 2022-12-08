# OSAA iV2GO Device Simulator

## Prerequisites

You must have access to a working IoT Central application.

## Installation

Clone the repository

```bash
git clone git@github.com:NordicodeApS/osaa-device-simulator.git
```

Change directory:

```bash
cd osaa-device-simulator
```

Install packages:

```bash
npm install
```

Start the watcher while developing:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Symlink the binary (globally):

```bash
npm link
```

## Usage

Run the following command to see a list of options:

```bash
iv2go-simulator --help
```

Example:

```bash
iv2go-simulator -d [device ID] -k [device key] -s [ID scope] -m [model ID] -i 30
```

>Note: if you get a "permission denied" error, you might need to make the js file executable.  
>You can do this by running: `chmod +x dist/index.js`


## Device key

The simulator connections to IoT Central by using the Shared access signature method.

The device key is specific for the device and is generated with the following console command:

```bash
az extension add --name azure-iot # if not already installed
az iot central device compute-device-key --primary-key <enrollment group primary key> --device-id <device ID>
```

> You might need to [install the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) for the command to work

The enrollment group primary key is the primary key of the Shared access signature of an enrollment group (also called Device connection group) that uses the SAS attestation type.

Read more: [https://learn.microsoft.com/en-gb/azure/iot-central/core/concepts-device-authentication#sas-enrollment-group](https://learn.microsoft.com/en-gb/azure/iot-central/core/concepts-device-authentication#sas-enrollment-group)

## Environment variables

If you find you're using the same values for `idScope` and `modelId` over and over again, or you don't want to compute device keys all the time, consider creating a `.env` file with some general values.

If you want to leave out the `deviceKey` option and instead generate a device key on-the-fly, add this variable:
```
DEVICE_GROUP_KEY=<enrollment group primary key>
```

You can also leave out the `idScope` and `modelId` options and instead add these variables:
```
DEVICE_ID_SCOPE=<ID scope>
DEVICE_MODEL_ID=<model ID>
```

If you add all the env variables above, you can launch a simulator simply by running:
```bash
iv2go-simulator -d [device ID]
```
