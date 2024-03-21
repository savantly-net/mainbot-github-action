import axios from "axios";

export interface OIDCTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  "not-before-policy": number;
  session_state: string;
  scope: string;
}

export interface GetOidcAccessTokenOptions {
  clientId: string;
  clientSecret: string;
  tokenEndpoint: string;
}

export async function getOidcAccessToken({
  clientId,
  clientSecret,
  tokenEndpoint,
}: GetOidcAccessTokenOptions): Promise<OIDCTokenResponse> {
  const payload = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  }).toString();

  try {
    const response = await axios.post<OIDCTokenResponse>(
      tokenEndpoint,
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // verify response status and data
    if (response.status !== 200) {
      throw new Error(
        `Failed to get oidc access token. HTTP status: ${response.status}`
      );
    }

    if (!response.data.access_token) {
      throw new Error("No access token found in oidc response");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching oidc access token:", error);
    throw error;
  }
}

// Usage example
// getOidcAccessToken('your-client-id', 'your-client-secret', 'https://your-oidc-server.com/token')
//   .then(token => console.log(token))
//   .catch(error => console.error(error));
