export interface ConfigViewerConfig {
  dangerouslyAnyoneCanReadAllTheFiles?: boolean;
  workingDirectory?: string;
  files: string[];
  ignore?: string[];
}

export interface Config {
  configViewer?: ConfigViewerConfig;
}
