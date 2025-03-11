/**
 * Common functionalities for the dashboards plugin.
 *
 * @packageDocumentation
 */

/**
 * @public
 */
export interface Dashboard {
  name: string;
  title?: string;
  description?: string;
  owner?: string;
  tags?: string[];
}
