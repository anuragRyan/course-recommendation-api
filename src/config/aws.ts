import * as AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const personalizeRuntime = new AWS.PersonalizeRuntime();
export const campaignArn = process.env.PERSONALIZE_CAMPAIGN_ARN || '';
```