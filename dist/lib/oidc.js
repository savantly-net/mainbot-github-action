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
exports.getOidcAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
function getOidcAccessToken(_a) {
    return __awaiter(this, arguments, void 0, function* ({ clientId, clientSecret, tokenEndpoint, }) {
        const payload = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials",
        }).toString();
        try {
            const response = yield axios_1.default.post(tokenEndpoint, payload, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            // verify response status and data
            if (response.status !== 200) {
                throw new Error(`Failed to get oidc access token. HTTP status: ${response.status}`);
            }
            if (!response.data.access_token) {
                throw new Error("No access token found in oidc response");
            }
            return response.data;
        }
        catch (error) {
            console.error("Error fetching oidc access token:", error);
            throw error;
        }
    });
}
exports.getOidcAccessToken = getOidcAccessToken;
// Usage example
// getOidcAccessToken('your-client-id', 'your-client-secret', 'https://your-oidc-server.com/token')
//   .then(token => console.log(token))
//   .catch(error => console.error(error));
