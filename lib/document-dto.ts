export interface DocumentDto {
    id?: string;
    namespace: string;
    uri: string;
    text: string;
    chunk: boolean;
    metadata?: Record<string, string>;
}
