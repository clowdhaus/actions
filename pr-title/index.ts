import * as core from '@actions/core';
import * as github from '@actions/github';

const githubToken = core.getInput('github-token', { required: true });
const titleRegexInput = core.getInput('title-regex');
const onFailrequestChanges = core.getInput('on-fail-request-changes') == 'true';
const onFailAddComment = core.getInput('on-fail-add-comment') == 'true';
const onFailMessage = core.getInput('on-fail-message');
const onFailFailAction = core.getInput('on-fail-fail-action') == 'true';

const octokit = github.getOctokit(githubToken);

async function run(): Promise<void> {
  const githubContext = github.context;
  const pullRequest = githubContext.issue;

  const titleRegex = new RegExp(titleRegexInput);
  const title: string = (githubContext.payload.pull_request?.title as string) ?? '';
  const comment = onFailMessage.replace('%regex%', titleRegex.source);

  core.debug(`Title Regex: ${titleRegex.source}`);
  core.debug(`Title: ${title}`);

  const titleMatchesRegex: boolean = titleRegex.test(title);
  if (!titleMatchesRegex) {
    if (onFailrequestChanges || onFailAddComment) {
      createReview(comment, pullRequest);
    }
    if (onFailFailAction) {
      core.setFailed(comment);
    }
  } else {
    if (onFailrequestChanges) {
      await dismissReview(pullRequest);
    }
  }
}

function createReview(comment: string, pullRequest: { owner: string; repo: string; number: number }) {
  void octokit.rest.pulls.createReview({
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
    body: comment,
    event: onFailAddComment ? 'COMMENT' : 'REQUEST_CHANGES',
  });
}

async function dismissReview(pullRequest: { owner: string; repo: string; number: number }) {
  const reviews = await octokit.rest.pulls.listReviews({
    owner: pullRequest.owner,
    repo: pullRequest.repo,
    pull_number: pullRequest.number,
  });

  reviews.data.forEach((review) => {
    const user = review.user;
    if (user && user.login == 'github-actions[bot]') {
      void octokit.rest.pulls.dismissReview({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
        review_id: review.id,
        message: 'All good!',
      });
    }
  });
}

run().catch((error) => {
  core.setFailed(error);
});
