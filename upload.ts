import * as fs from "fs";
import { glob } from "glob";
import fetch from "node-fetch";
import * as path from "path";

export type AddDocumentResponse = Array<string>;

export interface PostDocumentOptions {
  namespace: string;
  documentText: string;
  metadata: Record<string, string>;
  apiUrl: string;
  token?: string;
}

async function postDocument({
  namespace,
  documentText,
  metadata,
  apiUrl,
  token,
}: PostDocumentOptions) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        namespace: namespace,
        text: documentText,
        metadata: metadata,
      }),
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
    console.error("Error posting document:", error);
    return null;
  }
}

export interface UploadFilesOptions {
  namespace: string;
  globPatterns: string[];
  apiUrl: string;
  token?: string;
  metadata: Record<string, string>;
}

async function uploadFiles({
  namespace,
  globPatterns,
  apiUrl,
  token,
  metadata,
}: UploadFilesOptions): Promise<void> {
  console.log(
    `uploadFiles: namespace: ${namespace}, globPatterns: ${globPatterns}, apiUrl: ${apiUrl}`
  );
  console.log(`attaching metadata: ${JSON.stringify(metadata)}`);

  for (const globPattern of globPatterns) {
    await glob(globPattern, { nodir: true }).then(async (files) => {
      for (const file of files) {
        try {
          const fileContent = fs.readFileSync(file, "utf8");
          const relativePath = path.relative(process.cwd(), file);
          const response = await postDocument({
            namespace,
            documentText: fileContent,
            metadata: {
              ...metadata,
              path: relativePath,
            },
            apiUrl,
            token,
          });

          if (response) {
            console.log(
              `File uploaded successfully. ${relativePath} created vectors: ${file}`,
              response
            );
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    });
  }
}

export default uploadFiles;
