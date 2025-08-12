import { RootConfigService } from '@backstage/backend-plugin-api';
import { ScmIntegrations } from '@backstage/integration';

import { Octokit } from '@octokit/core';

export interface Issue {
  number: number;
  title: string;
  state: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  labels: string[];
}

interface GitHubIssuesResponse {
  repository: {
    issues: {
      edges: {
        node: {
          number: number;
          title: string;
          state: string;
          url: string;
          createdAt: string;
          updatedAt: string;
          author: {
            login: string;
          };
          labels: {
            edges: {
              node: {
                name: string;
              };
            }[];
          };
        };
      }[];
    };
  };
}

function extractIssuesFromGitHubIssuesResponse(
  response: GitHubIssuesResponse,
): Issue[] {
  return response.repository.issues.edges.map(edge => ({
    number: edge.node.number,
    state: edge.node.state,
    title: edge.node.title,
    url: edge.node.url,
    createdAt: edge.node.createdAt,
    updatedAt: edge.node.updatedAt,
    author: edge.node.author.login,
    labels: [], // edge.labels.edges.map(label => label.node.name),
  }));
}

function createOctokit(config: RootConfigService) {
  const integrations = ScmIntegrations.fromConfig(config);
  // TODO: Support on-prem installations
  const url = 'https://github.com';
  const integration = integrations.github.byUrl(url);
  if (!integration) {
    throw new Error(`No integration found for url: ${url}`);
  }
  return new Octokit({
    baseUrl: integration.config.apiBaseUrl,
    auth: integration.config.token,
  });
}

export async function getIssues(
  config: RootConfigService,
  repo: string,
  since: Date,
): Promise<Issue[]> {
  const octokit = createOctokit(config);
  const owner = repo.split('/')[0];
  const repoName = repo.split('/')[1];

  // This graphQL query
  //
  // 1. it goes then over all issues (incl. closed) from OLDEST to NEWEST
  //    to send notifications also in that order.
  // 1. it also filters by date since the scheduler has been started the last time.
  //    Or to be exact: since the latest update timestamp it founds
  //    So that it automatically pick ups the next page when there was more
  //    issues then one APIc all returns.
  const response = await octokit.graphql<GitHubIssuesResponse>(
    `
      query updatedIssues($owner: String!, $repo: String!, $since: DateTime!) {
        repository(owner: $owner, name: $repo) {
          issues(
            first: 100,
            filterBy: { since: $since }
            orderBy: { field: UPDATED_AT, direction: ASC }
          ) {
            edges {
              node {
                number
                title
                state
                url
                createdAt
                updatedAt
                author {
                  login
                }
                labels(first: 10) {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      owner,
      repo: repoName,
      since,
    },
  );

  // console.log('github response', JSON.stringify(response, null, 2));

  const issues = extractIssuesFromGitHubIssuesResponse(response);

  // console.log('github issues', JSON.stringify(issues, null, 2));

  return issues;
}
