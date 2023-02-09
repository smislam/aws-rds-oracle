import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, Peer, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, LicenseModel, OracleEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class AwsRdsOracleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcId = this.node.tryGetContext('vpcId');
    const databaseName = 'demodb';
    const username = 'demouser';
    
    const vpc = Vpc.fromLookup(this, 'ourvpc', {
      vpcId,
    });

    const secret = new Secret(this, 'dbsecret', {
      secretName: databaseName,
      description: `${databaseName} secret`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username
        }),
        generateStringKey: 'password',
        excludeCharacters: `/@" `,
        passwordLength: 28,

      }
    });

    const version = OracleEngineVersion.VER_19_0_0_0_2022_10_R1;
    const engine = DatabaseInstanceEngine.oracleSe2({version});
    const instanceType = InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.SMALL);

    const databaseInstance = new DatabaseInstance(this, 'oracle-instance', {
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      },
      engine,
      instanceType,
      databaseName,
      credentials: Credentials.fromSecret(secret),
      instanceIdentifier: databaseName,
      licenseModel: LicenseModel.LICENSE_INCLUDED,
      maxAllocatedStorage: 200,
      storageEncrypted: true,
      removalPolicy: RemovalPolicy.DESTROY
    });

    databaseInstance.connections.allowDefaultPortFrom(Peer.ipv4(vpc.vpcCidrBlock));

  }
}
