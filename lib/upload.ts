import { info, error as logError } from "@actions/core";
import * as fs from "fs";
import { glob } from "glob";
import fetch from "node-fetch";
import * as path from "path";
import { DocumentDto } from "./document-dto";

export type AddDocumentResponse = Array<string>;

export interface PostDocumentOptions {
  document: DocumentDto;
  apiUrl: string;
  token?: string;
}

async function postDocument({
  document,
  apiUrl,
  token,
}: PostDocumentOptions) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (token) {
    info(`Attaching token to request: ${token.slice(-8)}`);
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    info("No auth token provided");
  }

  const documentAddEndpoint = `${apiUrl}/api/document/add`;

  try {
    const response = await fetch(documentAddEndpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(document),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData}`
        );
      } catch (error) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const responseData = (await response.json()) as AddDocumentResponse;
    return responseData;
  } catch (error) {
    logError(`Error posting document: ${error}`);
    throw error;
  }
}

export interface UploadFilesOptions {
  namespace: string;
  globPatterns: string[];
  apiUrl: string;
  token?: string;
  baseFileUrl: string;
  commitSha?: string;
  commitRepo?: string;
  commitOwner?: string;
}

async function uploadFiles({
  namespace,
  globPatterns,
  apiUrl,
  token,
  baseFileUrl,
  commitOwner,
  commitRepo,
  commitSha,
}: UploadFilesOptions): Promise<void> {
  info(
    `uploadFiles: namespace: ${namespace}, globPatterns: ${globPatterns}, apiUrl: ${apiUrl}`
  );
  var metadata = {
    commitSha: commitSha || "",
    commitRepo: commitRepo || "",
    commitOwner: commitOwner || "",
  };
  info(`attaching metadata: ${JSON.stringify(metadata)}`);

  for (const globPattern of globPatterns) {
    await glob(globPattern, { nodir: true }).then(async (files) => {
      for (const file of files) {
        try {
          const fileContent = fs.readFileSync(file, "utf8");
          const fullUrl = `${baseFileUrl}/${file}`;
          const response = await postDocument({
            document: {
              namespace,
              id: `git://${commitOwner}/${commitRepo}/${file}`,
              uri: fullUrl,
              text: fileContent,
              chunk: true,
              metadata: {
                ...metadata,
                path: file,
                url: fullUrl,
              },
            },
            apiUrl,
            token,
          });

          if (response) {
            info(
              `uploaded ${fullUrl}`
            );
          }
        } catch (error) {
          logError("Error uploading file:" + error);
          throw error;
        }
      }
    });
  }
}

export default uploadFiles;
