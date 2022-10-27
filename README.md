# OSAA iV2GO Device Simulator

## Prerequisites

You must have access to a working IoT Central application.

## Installation

Clone the repository

```
git clone git@github.com:NordicodeApS/osaa-device-simulator.git
```

Change directory:

```
cd osaa-device-simulator
```

Install packages:

```
npm install
```

Build:

```
npm run build
```

Symlink the binary (globally):

```
npm link
```

## Usage

Run the following command to see a list of options:

```
iv2go-simulator --help
```

Example:

```
iv2go-simulator -d [device ID] -k [device key] -i [scope ID]
```

## Device key

The simulator connections to IoT Central by using the Shared access signature method.

The device key is specific for the device and is generated with the following console command:

```
az iot central device compute-device-key --primary-key <enrollment group primary key> --device-id <device ID>
```

> You might need to [install the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) for the command to work

The enrollment group primary key is the primary key of the Shared access signature of an enrollment group (also called Device connection group) that uses the SAS attestation type.

Read more: [https://learn.microsoft.com/en-gb/azure/iot-central/core/concepts-device-authentication#sas-enrollment-group](https://learn.microsoft.com/en-gb/azure/iot-central/core/concepts-device-authentication#sas-enrollment-group)
