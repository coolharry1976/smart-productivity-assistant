@"
# Smart Productivity Assistant (AWS Serverless)

Cloud-native task manager using **AWS Lambda**, **API Gateway**, **DynamoDB**, and **S3**.
Auth uses **JWT**, with custom Lambda authorizer. Frontend built with **Vite + React**.

## Live Demo
- **Frontend (S3 Website):** http://spa-frontend-20250818-1234.s3-website-us-east-1.amazonaws.com
- **API Base URL (API Gateway):** https://g1qq7sbid0.execute-api.us-east-1.amazonaws.com/prod

> Note: If the demo is paused or redeploying, you may briefly see errors.

## Stack
- **Backend:** AWS Lambda (Node.js 20), API Gateway (REST), DynamoDB (PAYG), SSM Parameter Store for JWT secret
- **Frontend:** React (Vite), deployed to S3 Website Hosting
- **Infra-as-code:** AWS SAM (`template.yaml`)

## Structure
spa-serverless/
├─ src/ # lambda handlers (register.js, login.js, tasks.js, secureHello.js)
├─ src/authorizer/ # custom JWT authorizer (index.js)
├─ spa-frontend/ # React app (Vite)
├─ template.yaml # SAM template
└─ samconfig.toml # SAM config (no secrets)

bash
Copy code

## Local Dev (Backend)
```bash
sam build
sam deploy --guided      # first time; afterwards: sam deploy
Local Dev (Frontend)
bash
Copy code
cd spa-frontend
npm install
npm run dev
Environment
Put secrets in SSM Parameter Store (e.g., /spa/JWT_SECRET).

Don’t commit any .env files.

## License
MIT