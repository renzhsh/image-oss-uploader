export interface AliyunOssSettings {
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    customDomain?: string;
}

export const DEFAULT_SETTINGS: AliyunOssSettings = {
    region: "",
    bucket: "",
    accessKey: "",
    secretKey: "",
    customDomain: "",
};


