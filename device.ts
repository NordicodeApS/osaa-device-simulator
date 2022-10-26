import { Mqtt as Protocol } from "azure-iot-device-mqtt";
import { SymmetricKeySecurityClient } from "azure-iot-security-symmetric-key";
import { ProvisioningDeviceClient } from "azure-iot-provisioning-device";
import { Mqtt as ProvisioningTransport } from "azure-iot-provisioning-device-mqtt";
import { Client as IoTDeviceClient } from "azure-iot-device";

const dpsProvisioningHost = "global.azure-devices-provisioning.net";

export class IoTCentralDevice {
  private log: (message: any) => void;
  private scopeId: string;
  private deviceId: string;
  private deviceKey: string;
  private modelId: string;

  private deviceClient: IoTDeviceClient;

  constructor(
    logFunc: (message: string) => void,
    scopeId: string,
    deviceId: string,
    deviceKey: string,
    modelId: string
  ) {
    this.log = logFunc;
    this.deviceId = deviceId;
    this.scopeId = scopeId;
    this.deviceKey = deviceKey;
    this.modelId = modelId;
  }

  public async getClient(): Promise<IoTDeviceClient> {
    this.log("Starting device registration...");

    const connectionString = await this.provisionDeviceClient();

    if (connectionString) {
      this.log("- Connection string is: " + connectionString);

      await this.connectDeviceClient(connectionString);
    } else {
      this.log("- Failed to obtain connection string for device.");
    }

    return this.deviceClient;
  }

  public async provisionDeviceClient(): Promise<string> {
    let connectionString = "";

    try {
      const provisioningSecurityClient = new SymmetricKeySecurityClient(
        this.deviceId,
        this.deviceKey
      );

      const provisioningClient = ProvisioningDeviceClient.create(
        dpsProvisioningHost,
        this.scopeId,
        new ProvisioningTransport(),
        provisioningSecurityClient
      );

      const provisioningPayload = {
        iotcModelId: this.modelId,
      };

      provisioningClient.setProvisioningPayload(provisioningPayload);

      connectionString = await new Promise<string>((resolve, reject) => {
        provisioningClient.register((dpsError, dpsResult) => {
          if (dpsError) {
            return reject(dpsError);
          }

          this.log("- DPS registration succeeded:");
          this.log(dpsResult);

          return resolve(
            `HostName=${dpsResult.assignedHub};DeviceId=${dpsResult.deviceId};SharedAccessKey=${this.deviceKey}`
          );
        });
      });
    } catch (ex) {
      this.log(
        `- Failed to instantiate client interface from configuration: ${ex.message}`
      );
    }

    return connectionString;
  }

  public async connectDeviceClient(connectionString: string): Promise<void> {
    this.log("Connecting the device...");

    try {
      this.deviceClient = await IoTDeviceClient.fromConnectionString(
        connectionString,
        Protocol
      );

      if (!this.deviceClient) {
        this.log(
          `- Failed to connect device client interface from connection string - device: ${this.deviceId}`
        );
      } else {
        this.log(`- IoT Central successfully connected device: ${this.deviceId}`);
      }
    } catch (ex) {
      this.log(`- IoT Central connection error: ${ex.message}`);
    }
  }

  public getDeviceId(): string {
    return this.deviceId;
  }
}
