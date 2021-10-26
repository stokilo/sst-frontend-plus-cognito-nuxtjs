import * as sst from '@serverless-stack/resources'
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers";
import { ApiAuthorizationType, Auth } from '@serverless-stack/resources'
import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2'
import { Function } from '@serverless-stack/resources'
import {
  ProviderAttribute, UserPool, UserPoolClient,
  UserPoolClientIdentityProvider, UserPoolIdentityProviderFacebook, UserPoolIdentityProviderGoogle,
  ClientAttributes, AccountRecovery
} from '@aws-cdk/aws-cognito'
import { App, Duration, RemovalPolicy } from '@aws-cdk/core'
import * as SSM from '@aws-cdk/aws-ssm'
import * as SM from '@aws-cdk/aws-secretsmanager'
import { PolicyStatement, Policy } from '@aws-cdk/aws-iam'

export default class ApiAndAuthStack extends sst.Stack {

  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props)

    const cognitoDomainPrefix = process.env.COGNITO_DOMAIN_PREFIX as string
    const cognitoCallbackUrlLocalMode = process.env.COGNITO_CALLBACK_URL_LOCAL_MODE as string
    const cognitoCallbackUrl = process.env.COGNITO_CALLBACK_URL as string
    const cognitoLogoutUrl = process.env.COGNITO_LOGOUT_URL as string

    const preSignupLambda = new Function(this, 'PreSignUp', {
      handler: 'src/preSignUp.handler'
    })

    const postAuthenticationLambda = new Function(this, "PostHandlerLambda", {
      handler: "src/postAuthentication.handler"
    })

    const userPool = new UserPool(this, 'TestUserPool', {
      userPoolName: 'TestUserPool',
      signInAliases: { email: true, phone: false, username: true },
      selfSignUpEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
      lambdaTriggers: {
        postAuthentication: postAuthenticationLambda,
        preSignUp: preSignupLambda,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      },
    })

    postAuthenticationLambda.role?.attachInlinePolicy(new Policy(this, 'userpool-policy', {
      statements: [new PolicyStatement({
        actions: ['cognito-idp:AdminUpdateUserAttributes'],
        resources: [userPool.userPoolArn],
      })],
    }));

    userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: cognitoDomainPrefix
      }
    })

    const apiSecrets = SM.Secret.fromSecretNameV2(this, 'AccountLevelApiSecrets',
      '/account/api/secrets',
    );

    const facebookProvider = new UserPoolIdentityProviderFacebook(this, 'Facebook', {
      userPool,
      clientId: apiSecrets.secretValueFromJson('FACEBOOK_CLIENT_ID').toString(),
      clientSecret: apiSecrets.secretValueFromJson('FACEBOOK_CLIENT_SECRET').toString(),
      scopes: ['public_profile', 'email'],
      attributeMapping: {
        email: ProviderAttribute.FACEBOOK_EMAIL
      }
    });

    const googleProvider = new UserPoolIdentityProviderGoogle(this, 'Google', {
      userPool,
      clientId: apiSecrets.secretValueFromJson('GOOGLE_CLIENT_ID').toString(),
      clientSecret: apiSecrets.secretValueFromJson('GOOGLE_CLIENT_SECRET').toString(),
      scopes: ['email'],
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        custom: {
          'email_verified': ProviderAttribute.other('email_verified')
        }
      }
    })

    const userPoolClient = new UserPoolClient(this, 'TestUserPoolClient', {
      userPool,
      disableOAuth: false,
      oAuth: {
        callbackUrls: [process.env.IS_LOCAL ? cognitoCallbackUrlLocalMode : cognitoCallbackUrl],
        logoutUrls: [process.env.IS_LOCAL ? cognitoCallbackUrlLocalMode : cognitoLogoutUrl]
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.FACEBOOK, UserPoolClientIdentityProvider.GOOGLE],
      readAttributes: new ClientAttributes().withStandardAttributes({
        email: true,
        emailVerified: true,
        phoneNumber: true
      }),
      writeAttributes: new ClientAttributes().withStandardAttributes({
        email: true,
        phoneNumber: true
      }),
      accessTokenValidity: Duration.minutes(10),
      idTokenValidity: Duration.minutes(10),
      refreshTokenValidity: Duration.minutes(60)
    })
    userPoolClient.node.addDependency(facebookProvider);
    userPoolClient.node.addDependency(googleProvider);

    const auth = new Auth(this, 'Auth', {
      cognito: {
        userPool,
        userPoolClient,
      }
    })

    const api = new sst.Api(this, 'Api', {
      defaultAuthorizationType: sst.ApiAuthorizationType.AWS_IAM,
      routes: {
        'GET /privateIAM': 'src/privateIAM.handler',
        "GET /privateJWT": {
          authorizationType: ApiAuthorizationType.JWT,
          authorizer: new HttpUserPoolAuthorizer({
            userPool,
            userPoolClient,
          }),
          function: "src/privateJWT.handler",
        },
      },
      cors: {
        allowMethods: [CorsHttpMethod.GET],
        allowOrigins: [cognitoCallbackUrlLocalMode, cognitoCallbackUrl],
        allowHeaders: ['*']
      }
    })
    auth.attachPermissionsForAuthUsers([api])

    new SSM.StringParameter(this, `AccountLevelStacksConfiguration`, {
      parameterName: `/account/stacks-config`,
      description: 'Stacks config account level wide.',
      stringValue: JSON.stringify(
        {
          userPoolId: userPool.userPoolId,
          userPoolClientId: userPoolClient.userPoolClientId,
          identityPoolId: auth.cognitoCfnIdentityPool.ref,
          apiEndpoint: api.url,
          region: scope.region,
          domainPrefix: cognitoDomainPrefix,
          apiName: 'TestAPI',
          apiNameIAM: 'TestAPIAuthorizeIAM',
          apiNameJWT: 'TestAPIAuthorizeJWT',
          redirectSignIn: process.env.IS_LOCAL ? cognitoCallbackUrlLocalMode : cognitoCallbackUrl,
          redirectSignOut: process.env.IS_LOCAL ? cognitoCallbackUrlLocalMode : cognitoLogoutUrl
        })
    })

    this.addOutputs({
      userPoolId: userPool.userPoolId,
      userPoolClientId: userPoolClient.userPoolClientId,
      identityPoolId: auth.cognitoCfnIdentityPool.ref,
      apiEndpoint: api.url,
      region: scope.region,
      domainPrefix: cognitoDomainPrefix,
      apiName: 'TestAPI',
      apiNameIAM: 'TestAPIAuthorizeIAM',
      apiNameJWT: 'TestAPIAuthorizeJWT',
      redirectSignIn: process.env.IS_LOCAL ? cognitoCallbackUrlLocalMode : cognitoCallbackUrl,
      redirectSignOut: process.env.IS_LOCAL ? cognitoCallbackUrlLocalMode : cognitoLogoutUrl
    })
  }
}
