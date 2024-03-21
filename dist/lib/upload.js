"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core_1 = require("@actions/core");
const fs = __importStar(require("fs"));
const glob_1 = require("glob");
const node_fetch_1 = __importDefault(require("node-fetch"));
const path = __importStar(require("path"));
function postDocument(_a) {
    return __awaiter(this, arguments, void 0, function* ({ namespace, documentText, metadata, apiUrl, token, }) {
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
        if (token) {
            (0, core_1.info)(`Attaching token to request: ${token.slice(-8)}`);
            headers["Authorization"] = `Bearer ${token}`;
        }
        else {
            (0, core_1.info)("No auth token provided");
        }
        const documentAddEndpoint = `${apiUrl}/api/document/add`;
        try {
            const response = yield (0, node_fetch_1.default)(documentAddEndpoint, {
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
                    const errorData = yield response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
                }
                catch (error) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            const responseData = (yield response.json());
            return responseData;
        }
        catch (error) {
            (0, core_1.error)(`Error posting document: ${error}`);
            throw error;
        }
    });
}
function uploadFiles(_a) {
    return __awaiter(this, arguments, void 0, function* ({ namespace, globPatterns, apiUrl, token, metadata, }) {
        (0, core_1.info)(`uploadFiles: namespace: ${namespace}, globPatterns: ${globPatterns}, apiUrl: ${apiUrl}`);
        (0, core_1.info)(`attaching metadata: ${JSON.stringify(metadata)}`);
        for (const globPattern of globPatterns) {
            yield (0, glob_1.glob)(globPattern, { nodir: true }).then((files) => __awaiter(this, void 0, void 0, function* () {
                for (const file of files) {
                    try {
                        const fileContent = fs.readFileSync(file, "utf8");
                        const relativePath = path.relative(process.cwd(), file);
                        const response = yield postDocument({
                            namespace,
                            documentText: fileContent,
                            metadata: Object.assign(Object.assign({}, metadata), { path: relativePath }),
                            apiUrl,
                            token,
                        });
                        if (response) {
                            (0, core_1.info)(`File uploaded successfully. ${relativePath} created vectors: ${file}`);
                        }
                    }
                    catch (error) {
                        (0, core_1.error)("Error uploading file:" + error);
                        throw error;
                    }
                }
            }));
        }
    });
}
exports.default = uploadFiles;
