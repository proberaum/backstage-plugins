/**
 * Annotation key for the hcloud server reference (ID or name).
 * Numeric values are treated as server IDs, non-numeric as server names.
 *
 * @public
 */
export const HCLOUD_SERVER_ANNOTATION = 'hcloud/server';

/**
 * Annotation key for the hcloud project.
 * Must match a key in hcloud.projects config. Optional — falls back to defaultProject.
 *
 * @public
 */
export const HCLOUD_PROJECT_ANNOTATION = 'hcloud/project';
