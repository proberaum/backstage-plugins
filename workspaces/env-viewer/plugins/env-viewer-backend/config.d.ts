export interface EnvViewerConfig {
  dangerouslyAnyoneCanReadAllEnvVars?: boolean;
}

export interface Config {
  envViewer?: EnvViewerConfig;
}
