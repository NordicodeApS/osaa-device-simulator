import { Client as IoTDeviceClient, Message, Twin } from "azure-iot-device";
import { IoTCentralDevice } from "./device";

export class Simulator {
  private log: (message: any) => void;
  private device: IoTCentralDevice;
  private intervalTimeout: NodeJS.Timeout;
  private interval: number;
  private client: IoTDeviceClient;

  // Telemetry properties
  private messageTrackingId: number;
  private batteryLevel: number;
  private timeLeftOfTreatment: number;
  private liquidLeftInBag: number;
  private flowrate: number;

  constructor(
    logFunc: (message: string) => void,
    device: IoTCentralDevice,
    interval: number = 2
  ) {
    this.log = logFunc;
    this.device = device;
    this.interval = interval * 1000;

    // Initial telemetry values
    this.messageTrackingId = 0;
    this.batteryLevel = 60 + Math.random() * 40;
    this.timeLeftOfTreatment = 12 * 60 * 60; // 12 hours in seconds
    this.liquidLeftInBag = 840;
    this.flowrate = 70;
  }

  public async run(): Promise<void> {
    this.log("Starting simulator");
    this.log("- Sending a message every " + this.interval / 1000 + " seconds");

    this.client = await this.device.getClient();

    if (!this.client) {
      this.log("Exiting...");
      return;
    }

    this.client.on("connect", () => this.connectHandler());
    this.client.on("disconnect", () => this.disconnectHandler());
    this.client.on("message", (msg: any) => this.messageHandler(msg));
    this.client.on("error", (err: any) => this.errorHandler(err));

    this.client.open().catch((err) => {
      this.log("Could not connect: " + err.message);
    });
  }

  public connectHandler(): void {
    this.log("- Device connected");

    // Create a message and send it to the IoT Hub every X seconds
    if (!this.intervalTimeout) {
      this.intervalTimeout = setInterval(() => {
        const message = this.generateMessage();

        this.log("Sending message: " + message.getData());

        this.client.sendEvent(message, this.printResultFor("send"));

        this.log("Getting device twin...");

        this.client.getTwin((err: Error, twin: Twin): void => {
          if (err) {
            this.log("- Could not get twin");
            this.log(err);
          } else {
            this.log("- Got the twin");
            this.log("Reporting properties...");

            // create a patch to send to the hub
            let patch = {
              DeviceId: this.device.getDeviceId(),
              messageTrackingId: this.messageTrackingId,
              oad: false,
            };

            // send the patch
            twin.properties.reported.update(patch, (err: Error): void => {
              if (err) {
                this.log("- An error occurred");
                this.log(err);
              } else {
                this.log("- Twin state reported");
              }
            });
          }
        });
      }, this.interval);
    }
  }

  public disconnectHandler(): void {
    clearInterval(this.intervalTimeout);

    this.intervalTimeout = null;

    this.client.open().catch((err) => {
      this.log(err.message);
    });
  }

  public messageHandler(msg: any): void {
    this.log("Id: " + msg.messageId + " Body: " + msg.data);

    this.client.complete(msg, this.printResultFor("completed"));
  }

  public errorHandler(err: any): void {
    this.log(err.message);
  }

  public printResultFor(op: any): (err: any, res: any) => void {
    return (err: any, res: any): void => {
      if (err) this.log(op + " error: " + err.toString());
      if (res) this.log(op + " status: " + res.constructor.name);
    };
  }

  public generateMessage(): Message {
    // Increment the message tracking ID
    this.messageTrackingId = this.messageTrackingId + 1;

    // Decrease the battery a bit for each message
    this.batteryLevel = this.batteryLevel - 0.05;

    // Subtract time from time left of treatment
    this.timeLeftOfTreatment = this.timeLeftOfTreatment - this.interval / 1000;

    // Liquid left is determined by the flowrate and the interval of the messages
    this.liquidLeftInBag =
      this.liquidLeftInBag - (this.flowrate / 60 / 60) * (this.interval / 1000);

    const data: string = JSON.stringify({
      batteryLevel: Math.round(this.batteryLevel),
      timeLeftOfTreatment: new Date(1000 * this.timeLeftOfTreatment)
        .toISOString()
        .substring(11, 16), // format as "HH:mm"
      liquidLeftInBag: Math.round(this.liquidLeftInBag),
      flowrate: this.flowrate,
    });

    const message: Message = new Message(data);

    // message.properties.add(
    //   "messageTrackingId", this.messageTrackingId
    // );

    return message;
  }
}
