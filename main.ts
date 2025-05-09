import { Plugin, Setting, PluginSettingTab, MarkdownView } from "obsidian";
import { AliyunOssSettings, DEFAULT_SETTINGS } from "./settings";
import OSS from "ali-oss";

export class AliyunOssSettingTab extends PluginSettingTab {
    plugin: AliyunOSSUploader;
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		new Setting(containerEl)
			.setName("Region")
			.setDesc("OSS data center region, e.g. oss-cn-hangzhou")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.region)
					.onChange(async (value) => {
						this.plugin.settings.region = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("AccessKey ID")
			.setDesc("The accessKey id of Aliyun OSS")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.accessKey)
					.onChange(async (value) => {
						this.plugin.settings.accessKey = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("AccessKey Secret")
			.setDesc("The accessKey secret of Aliyun OSS")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.secretKey)
					.onChange(async (value) => {
						this.plugin.settings.secretKey = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Bucket Name")
			.setDesc("The bucket name of store images")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.bucket)
					.onChange(async (value) => {
						this.plugin.settings.bucket = value;
						await this.plugin.saveSettings();
					})
			);
		// 类似方式添加 bucket、accessKey、secretKey 设置
	}
}

export default class AliyunOSSUploader extends Plugin {
	settings: AliyunOssSettings;

	async onload() {
		// 监听剪贴板粘贴事件（paste）
		this.registerEvent(
			this.app.workspace.on("editor-paste", (evt: ClipboardEvent) => {
				if (!evt.clipboardData?.items) return;

				// 检查是否是图片
				for (const item of evt.clipboardData.items) {
					if (item.type.startsWith("image/")) {
						evt.preventDefault(); // 阻止默认粘贴
						this.handleImageUpload(item.getAsFile()!);
					}
				}
			})
		);

		// 监听拖拽事件（drop）
		this.registerEvent(
			this.app.workspace.on("editor-drop", (evt: DragEvent) => {
				if (!evt.dataTransfer?.files) return;

				for (const file of evt.dataTransfer.files) {
					if (file.type.startsWith("image/")) {
						evt.preventDefault();
						this.handleImageUpload(file);
					}
				}
			})
		);

		await this.loadSettings();
		this.addSettingTab(new AliyunOssSettingTab(this.app, this));

	}

	async uploadToOSS(file: File): Promise<string | null> {
		const client = new OSS({
			region: this.settings.region,       // e.g. "oss-cn-hangzhou"
			accessKeyId: this.settings.accessKey,
			accessKeySecret: this.settings.secretKey,
			bucket: this.settings.bucket,
		});

		try {
			const fileName = `${Date.now()}_${file.name}`;
			const result = await client.put(fileName, file);
			return result.url;
		} catch (error) {
			console.error("OSS Upload Error:", error);
			return null;
		}
	}

	async handleImageUpload(file: File) {
		const ossUrl = await this.uploadToOSS(file);
		if (!ossUrl) return;

		// 替换当前光标位置的文本
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			activeView.editor.replaceSelection(`![](${ossUrl})`);
		}
	}
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}

}

