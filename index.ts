import { getInput, getMultilineInput, setFailed, info, error as logError } from "@actions/core";
import github from "@actions/github";
import uploadFiles from "./upload";

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
    const tokenUrl = `${apiUrl}/oauth/token`;

    github.context.serverUrl;

    let token: string | undefined;

    if (clientId && clientSecret) {
      info("Getting OAuth token");
      token = await getOAuthToken({
        clientId,
        clientSecret,
        tokenUrl,
      });
    }

    uploadFiles({
      namespace,
      globPatterns,
      apiUrl,
      token,
      metadata: {
        commitSha: github.context.sha,
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
      },
    });
  } catch (error) {
    logError(JSON.stringify(error))
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
