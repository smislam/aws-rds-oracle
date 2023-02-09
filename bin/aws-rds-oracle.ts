#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsRdsOracleStack } from '../lib/aws-rds-oracle-stack';

const app = new cdk.App();
new AwsRdsOracleStack(app, 'AwsRdsOracleStack', {
   env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});