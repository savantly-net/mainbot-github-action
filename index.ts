import core from "@actions/core";
import github from "@actions/github";
import uploadFiles from "./upload";

async function run() {
  try {
    const globPatterns = core.getInput("glob-patterns", {
      required: true,
    });
    const namespace = core.getInput("namespace", {
      required: true,
    });
    const apiUrl = core.getInput("api-url", {
      required: true,
    });

    const clientId = core.getInput("client-id");
    const clientSecret = core.getInput("client-secret");
    const tokenUrl = `${apiUrl}/oauth/token`;

    const globPatternArray = globPatterns.split("\n");

    github.context.serverUrl;

    let token: string | undefined;

    if (clientId && clientSecret) {
      token = await getOAuthToken({
        clientId,
        clientSecret,
        tokenUrl,
      });
    }

    uploadFiles({
      namespace,
      globPatterns: globPatternArray,
      apiUrl,
      token,
      metadata: {
        commitSha: github.context.sha,
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
      },
    });
  } catch (error) {
    core.setFailed(JSON.stringify(error));
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
