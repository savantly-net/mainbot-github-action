import {
  getInput,
  getMultilineInput,
  info,
  error as logError,
  setFailed,
} from "@actions/core";
import { context } from "@actions/github";
import uploadFiles from "./lib/upload";

async function run() {
  try {
    const globPatterns = getMultilineInput("glob-patterns", {
      required: true,
    });
    const namespace = getInput("namespace", {
      required: true,
    });
    const apiUrl = getInput("api-url", {
      required: true,
    });

    const clientId = getInput("client-id");
    const clientSecret = getInput("client-secret");
    const tokenUrl = getInput("token-url");

    let token: string | undefined;

    if (clientId && clientSecret) {
      if (!tokenUrl) {
        throw new Error("token-url is required if client-id and client-secret are provided");
      }
      info("Getting OAuth token");
      token = await getOAuthToken({
        clientId,
        clientSecret,
        tokenUrl,
      });
    } else {
      info("No client id or client secret provided, uploading without token");
    }

    uploadFiles({
      namespace,
      globPatterns,
      apiUrl,
      token,
      metadata: {
        commitSha: context.sha,
        repo: context.repo.repo,
        owner: context.repo.owner,
      },
    });
  } catch (error) {
    logError(JSON.stringify(error));
    setFailed(JSON.stringify(error));
  }
}

interface getOAuthTokenOptions {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
}

async function getOAuthToken({
  clientId,
  clientSecret,
  tokenUrl,
}: getOAuthTokenOptions): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

run();
