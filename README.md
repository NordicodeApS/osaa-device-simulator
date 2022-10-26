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
