"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const upload_1 = __importDefault(require("./upload"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const globPatterns = core_1.default.getInput("glob-patterns", {
                required: true,
            });
            const namespace = core_1.default.getInput("namespace", {
                required: true,
            });
            const apiUrl = core_1.default.getInput("api-url", {
                required: true,
            });
            const clientId = core_1.default.getInput("client-id");
            const clientSecret = core_1.default.getInput("client-secret");
            const tokenUrl = `${apiUrl}/oauth/token`;
            const globPatternArray = globPatterns.split("\n");
            github_1.default.context.serverUrl;
            let token;
            if (clientId && clientSecret) {
                token = yield getOAuthToken({
                    clientId,
                    clientSecret,
                    tokenUrl,
                });
            }
            (0, upload_1.default)({
                namespace,
                globPatterns: globPatternArray,
                apiUrl,
                token,
                metadata: {
                    commitSha: github_1.default.context.sha,
                    repo: github_1.default.context.repo.repo,
                    owner: github_1.default.context.repo.owner,
                },
            });
        }
        catch (error) {
            core_1.default.setFailed(JSON.stringify(error));
        }
    });
}
function getOAuthToken(_a) {
    return __awaiter(this, arguments, void 0, function* ({ clientId, clientSecret, tokenUrl, }) {
        const credentials = btoa(`${clientId}:${clientSecret}`);
        const response = yield fetch(tokenUrl, {
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
        const data = yield response.json();
        return data.access_token;
    });
}
run();
