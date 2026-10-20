# Deploying to Vercel (keyless Google Cloud auth)

The org policy `iam.disableServiceAccountKeyCreation` blocks service account
keys, so production uses **Workload Identity Federation**: each Vercel
deployment gets a short-lived OIDC token, Google Cloud trusts it, and
`/api/ask` swaps it for a short-lived token acting as the service account.
Nothing secret is stored anywhere. The code is in `app/api/ask/route.ts`
(`authClient`).

## Branches and environments

| Branch | Deploys to | Live demo (`/api/ask`) |
|---|---|---|
| `main` | Production | On |
| `staging` | Preview, at a fixed staging URL | On (step 4) |
| any other branch / pull request | Preview, its own URL | Off: no Google Cloud settings, so it spends no quota |

Work flows feature branch → pull request into `staging` → check the staging
URL → pull request `staging` → `main`. GitHub Actions (`.github/workflows/ci.yml`)
typechecks and builds every pull request into either branch.

## 1. Create the Vercel project

1. Push the repo to GitHub, then import it at vercel.com/new.
2. Note your **team slug** (in the dashboard URL: `vercel.com/<team-slug>`)
   and the **project name**.
3. Project → Settings → Security → **Secure backend access with OIDC
   federation**: enabled, issuer mode **Team**.

## 2. Google Cloud (one time)

Fill in the first four lines, then paste the rest as-is. Keep the braces in
`${VERCEL_PROJECT}:` and similar: in zsh, an unbraced `$VERCEL_PROJECT:e…` is
read as a modifier and silently drops the name.

Already set up for this site: the pool and provider are `vercel`, and the
service account is the existing `vertex-ai-user@wpa-rag-system.iam.gserviceaccount.com`
(it already had `roles/aiplatform.user`), so the create steps were skipped.

```sh
PROJECT_ID=<your project id>
TEAM=<vercel team slug>
VERCEL_PROJECT=<vercel project name>
SA_NAME=ask-archive

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SA=$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com

gcloud services enable iamcredentials.googleapis.com sts.googleapis.com --project=$PROJECT_ID

# Service account the site acts as (skip create if it already exists).
gcloud iam service-accounts create $SA_NAME --project=$PROJECT_ID
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" --role="roles/aiplatform.user"

# Trust Vercel's OIDC tokens, but only for this team.
gcloud iam workload-identity-pools create vercel \
  --project=$PROJECT_ID --location=global --display-name="Vercel"
gcloud iam workload-identity-pools providers create-oidc vercel \
  --project=$PROJECT_ID --location=global --workload-identity-pool=vercel \
  --issuer-uri="https://oidc.vercel.com/$TEAM" \
  --allowed-audiences="https://vercel.com/$TEAM" \
  --attribute-mapping="google.subject=assertion.sub" \
  --attribute-condition="assertion.owner == '$TEAM'"

# Only this project's production deployments may act as the service account.
gcloud iam service-accounts add-iam-policy-binding $SA --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principal://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/vercel/subject/owner:${TEAM}:project:${VERCEL_PROJECT}:environment:production"

echo "GCP_PROJECT_NUMBER=$PROJECT_NUMBER"
echo "GCP_SERVICE_ACCOUNT_EMAIL=$SA"
```

Staging is a preview deployment, so it needs the preview binding too
(step 4 limits it to the `staging` branch on the Vercel side):

```sh
gcloud iam service-accounts add-iam-policy-binding $SA --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principal://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/vercel/subject/owner:${TEAM}:project:${VERCEL_PROJECT}:environment:preview"
```

## 3. Vercel environment variables (Production)

| Name | Value |
|---|---|
| `GCP_PROJECT_ID` | same as `.env.local` |
| `GCP_LOCATION` | `us-central1` |
| `RAG_CORPUS` | same as `.env.local` |
| `GEMINI_MODEL` | same as `.env.local` |
| `GEMINI_LOCATION` | `global` |
| `GCP_PROJECT_NUMBER` | printed above |
| `GCP_WORKLOAD_IDENTITY_POOL_ID` | `vercel` |
| `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID` | `vercel` |
| `GCP_SERVICE_ACCOUNT_EMAIL` | printed above |

Redeploy after adding them.

## 4. Staging

1. Settings → Environment Variables: add the same nine variables again for
   **Preview**, and in the branch field choose **`staging`**. Scoped to that
   branch, they reach the staging deployment and no other preview, so pull
   request previews can't call Gemini.
2. Settings → Domains (optional): add a staging domain such as
   `staging.<your-domain>` and set its Git branch to `staging`. Without one,
   the stable URL is `<project>-git-staging-<team>.vercel.app`.
3. Redeploy the latest `staging` deployment so it picks up the variables.

## 5. Check

Run against production, then the staging URL:

```sh
curl -X POST https://<your-domain>/api/ask -H "Content-Type: application/json" \
  -d '{"question":"How did people learn they were free?"}'
```

If it returns 502, open the deployment's **Logs** in Vercel and find the
`[ask]` line. Common causes:

- `invalid_grant` / audience error: team slug or issuer mode doesn't match step 1.
- 403 on `generateAccessToken`: the `workloadIdentityUser` binding subject
  doesn't match (project name or environment).
- 403 on aiplatform: the service account is missing `roles/aiplatform.user`.
