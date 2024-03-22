# mainbot-github-action


This GitHub Action enables you to automatically upload files from your repository to a mainbot API endpoint.   

## Inputs

### `glob-pattern`

**Required** The glob pattern used to find files in the repository. Default: `./docs/**`.  

### `namespace`

**Required** The namespace of the mainbot API endpoint.  

### `api-url`

**Required** The Mainbot API endpoint to which files will be uploaded.  

### `client-id`

**Optional** The client ID for OAuth authentication, if required by your API.  

### `client-secret`

**Optional** The client secret for OAuth authentication, if required by your API.  

### `token-endpoint`

**Optional** The token endpoint for OAuth authentication, if required by your API.



## Features

- Glob pattern matching for selecting files.
- Upload files with metadata including relative file paths, repo, and owner.
- OAuth token authentication support.

## Prerequisites

- A GitHub repository where this action can be implemented.
- Necessary credentials (like `client_id` and `client_secret`) if the target API requires OAuth authentication.

## Installation

1. **Add GitHub Action to Your Repository**

   Create a `.github/workflows` directory in the root of your repository (if it doesn't already exist), and add a new YAML file for your workflow (e.g., `upload-files.yml`).

2. **Configure Workflow File**

   Set up your workflow file with the required steps. Below is an example configuration:

   ```yaml
   name: Upload Files to API

   on:
     workflow_dispatch: {} # Enable manual triggering
     push:
       branches:
         - main  # Set your branch here
       paths:
         - 'docs/**'  # Set your docs folder path here

   jobs:
     upload:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout repository
           uses: actions/checkout@v2
         
         - name: Upload Files
           uses: savantly-net/mainbot-github-action@main
           with:
             glob-patterns: '**/*.txt'  # Set your file pattern here
             namespace: '/admin'
             api-url: 'https://mainbot.savantly.net' # Set your Mainbot API endpoint here
             client-id: ${{ secrets.CLIENT_ID }} # Set your client ID here
             client-secret: ${{ secrets.CLIENT_SECRET }} # Set your client secret here
             token-endpoint: 'https://mainbot.savantly.net/oauth/token' # Set your token endpoint here
   ```

3. **Set GitHub Secrets**

   Go to your repository's Settings > Secrets and add your `CLIENT_ID` and `CLIENT_SECRET`.

## Usage

Once installed, the action will run automatically based on the defined triggers in your workflow file (e.g., on every push to the `main` branch). The action will:

1. Search for files in your repository matching the defined glob pattern.
2. For each file found, upload it to the specified API endpoint with the file's content and its relative path in the metadata.


## Support

For support, issues, or feature requests, please file an issue on the [GitHub repository](https://github.com/savantly-net/mainbot-github-action/issues).

