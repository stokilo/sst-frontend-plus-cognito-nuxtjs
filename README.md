#### What is it?

This is a sandbox project for testing Cognito and frontend app deployment to the Cloudflare workers.
It includes:

1. Facebook and Google providers for Cognito identity and user pools.
2. Integrates auth modules from Amplify library.
3. JWT and IAM API endpoint to test 1 & 2
4. Cloudflare worker integration to deploy Vue SPA to the cloud from CLI.
5. Client side NuxtJs with Vue 2.x

Sandbox index page for testing login/amplify model output/testing JWT/IAM requests:


![picture 1](images/53bce75bd26aa668617bbb5477a64f369f75d5148fd55185bd5d41adfca58d00.png)  


Vue3 version without user pool amplify integration:

https://github.com/stokilo/sst-frontend-plus-cognito


Note: all credentials for this setup are stored under single AWS secret with name:

```/account/api/secrets``` 

Secret is not provisioned. Must be created by hand using AWS Console. Values are described in sections below.

### Facebook Login setup

Create new test application using Facebook for developers platform.

Select 'Add Product' and select Facebook Login. 

Copy values from:

![picture 2](images/8e16ace184e4206e2f569a5a2007d70d06b3fc280c4f62699cc2f404217decad.png)  

Login to AWS Secrets Manager->Store Secret

/account/api/secrets

Add two keys

FACEBOOK_CLIENT_SECRET

FACEBOOK_CLIENT_ID

Set Website URL:

Copy domain name from AWS Cognito admin panel:

![picture 4](images/1f3e771a220a3eda0878519ea61e92b26b790a5d70028c576b45ca3acb51bea2.png)  

To Facebook admin panel Basic->Settings->Website:
Append to the URL following path: `/oauth2/idpresponse`

![picture 3](images/fafa793a04b02712b2b9c10c08bac01c2f57c7a2ddde701b1b94bd5ffc99b004.png)  

Add Website URL to App Domains under Basic->Settings->App Domains
![picture 6](images/b1991f1e7cc98a3c9262d3fd37a1c8b10c6de791cce97ec0bca4b7553c32161a.png)  

### Google Login setup

Create new application:

![picture 1](images/1860207d590066970193a9b3fe968898072f5396801b3a8f8f7be4c0657f6744.png)  

Login to AWS Secrets Manager->Store Secret

/account/api/secrets

Add two keys

GOOGLE_CLIENT_SECRET

GOOGLE_CLIENT_ID

Copy domain name from AWS Cognito admin panel:

![picture 4](images/1f3e771a220a3eda0878519ea61e92b26b790a5d70028c576b45ca3acb51bea2.png)  


Add auth origins

![picture 2](images/2541a56c67a8c81e4e91153216fb2bc33dc931970778ab1e9b31690d67cb8fec.png)  




Add authorized URIs

Append to the URL following path: `/oauth2/idpresponse`

![picture 3](images/e8254ccbd0e2ed2b6339be6bdf246facd18e7b8535aae29e8e898455780bf2f0.png)  

#### Cloudflare setup

Login to AWS Secrets Manager->Store Secret

/account/api/secrets

Add 3 keys

CLOUDFLARE_ACCOUNT_ID

CLOUDFLARE_ZONE_ID   

CLOUDFLARE_API_TOKEN

where account and one ids should be copied from Cloudflare admin interface.
Api token should be generated from 'worker template' with adjusted permissions and zone id.

Edit wrangler.toml and fill:

account_id=
zone_id=

replace *stokilo.com domains mapping with your own:

name
routes

for dev and prod profiles. 

![picture 1](images/c7d11d7aea5d8c0ffb4c3ceefb1e9542a7cfa0649c260f880e08e707a15bec56.png)  

#### Domain setup 

To keep it simple domain names are hardcoded in all files and not read from env variables.
Search and Replace all instances of 'stokilo.com' domain with your own.

#### Backend 

Start by installing the dependencies.

```bash
$ yarn install
```

Deploys server cloudformation stack to the AWS and frontend app to the Cloudflare worker.
Two stages are coded in the npm scripts (dev and prod):

```bash
$ yarn deploy-dev
$ yarn deploy-prod
```

Start development with live lambda reload

```bash
$ yarn start
```

#### Frontend 

Navigate to the frontend source dir:
```bash
$ cd frontend
```

Development mode
```bash
$ yarn install
$ yarn serve
```

Build for production
```bash
$ yarn build
```

Build for production and deploy to the Cloudflare PROD or DEV worker instance
```bash
$ yarn deploy-dev
$ yarn deploy-prod
```
