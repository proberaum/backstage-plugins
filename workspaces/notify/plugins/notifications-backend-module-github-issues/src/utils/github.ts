import { RootConfigService } from "@backstage/backend-plugin-api";
import { ScmIntegrations } from "@backstage/integration";

import { Octokit } from "@octokit/core";

export interface Issue {
  number: number;
  title: string;
  state:string;
  url: string;
  author: string;
  labels: string[];
}

interface GetLastIssuesResponse {
  repository: {
    issues: {
      edges: {
        node: {
          number: number;
          title: string;
          state:string;
          url: string;
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
    }
  };
}

function extractIssuesFromGitHubResponse(response: GetLastIssuesResponse): Issue[] {
  return response.repository.issues.edges.map(edge => ({
    number: edge.node.number,
    state: edge.node.state,
    title: edge.node.title,
    url: edge.node.url,
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

export async function getLastIssues(config: RootConfigService, repo: string): Promise<Issue[]> {
  const octokit = createOctokit(config);
  const owner = repo.split('/')[0];
  const repoName = repo.split('/')[1];

  const response = await octokit.graphql<GetLastIssuesResponse>(
    `
      query lastIssues($owner: String!, $repo: String!, $num: Int = 20) {
        repository(owner: $owner, name: $repo) {
          issues(last: $num) {
            edges {
              node {
                number
                title
                state
                url
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
    },
  );

  // console.log('github response', JSON.stringify(response, null, 2));

  const issues = extractIssuesFromGitHubResponse(response);

  // console.log('github issues', JSON.stringify(issues, null, 2));

  return issues;
}
