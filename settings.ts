export interface AliyunOssSettings {
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    targetPath?: string;
}

export const DEFAULT_SETTINGS: AliyunOssSettings = {
    region: "",
    bucket: "",
    accessKey: "",
    secretKey: "",
    targetPath: ""
};


