import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { logger } from '../logger.js';
import {
  DeliveryMedium,
  DeliveryService,
  SignInMethod,
  SmsOptions,
  SnsServiceConfig,
} from '../types.js';

/**
 * SNS service Implementation.
 * Sends message via SNS client.
 */
export class SnsService implements DeliveryService {
  deliveryMedium: DeliveryMedium = 'SMS';

  /**
   * SNS Service constructor
   * @param snsClient - SNS Client to use for sending messages. Defaults to SNSClient. Can be overridden for testing.
   * @param config - SNS Service configuration
   */
  constructor(private snsClient: SNSClient, private config: SnsServiceConfig) {}

  public send = async (
    secret: string,
    destination: string,
    challengeType: SignInMethod
  ): Promise<void> => {
    const config = this.getConfig(challengeType);
    const message = config.message?.replace('####', secret);

    // SNS attributes
    const attributes: PublishCommand['input']['MessageAttributes'] = {};
    if (config.senderId && config.senderId !== '') {
      attributes['AWS.SNS.SMS.SenderID'] = {
        DataType: 'String',
        StringValue: config.senderId,
      };
    }
    if (config.originationNumber && config.originationNumber !== '') {
      attributes['AWS.SNS.SMS.OriginationNumber'] = {
        DataType: 'String',
        StringValue: config.originationNumber,
      };
    }

    // SNS Command
    const snsCommand = new PublishCommand({
      Message: message,
      PhoneNumber: destination,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          StringValue: 'Transactional',
          DataType: 'String',
        },
        ...attributes,
      },
    });

    // Send SMS via SNS
    const output = await this.snsClient.send(snsCommand);
    logger.debug(`SMS sent: ${JSON.stringify(output, null, 2)}`);
  };

  public mask = (destination: string): string => {
    const show = destination.length < 8 ? 2 : 4;
    return `+${new Array(11 - show).fill('*').join('')}${destination.slice(
      -show
    )}`;
  };

  private getConfig = (challengeType: SignInMethod): Partial<SmsOptions> => {
    switch (challengeType) {
      case 'MAGIC_LINK':
        return this.config.magicLink;
      case 'OTP':
        return this.config.otp;
    }
  };
}
