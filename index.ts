import {
  getInput,
  getMultilineInput,
  info,
  error as logError,
  setFailed,
} from "@actions/core";
import { context } from "@actions/github";
import { OIDCTokenResponse, getOidcAccessToken } from "./lib/oidc";
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
    const tokenEndpoint = getInput("token-endpoint");

    let token: OIDCTokenResponse | undefined = undefined;

    if (clientId && clientSecret) {
      if (!tokenEndpoint) {
        throw new Error(
          "token-url is required if client-id and client-secret are provided"
        );
      }
      info("Getting OAuth token");
      token = await getOidcAccessToken({
        clientId,
        clientSecret,
        tokenEndpoint,
      });
    } else {
      info("No client id or client secret provided, uploading without token");
    }

    uploadFiles({
      namespace,
      globPatterns,
      apiUrl,
      token: token?.access_token,
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

run();
