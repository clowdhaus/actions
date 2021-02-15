<h1 style="font-size: 56px; margin: 0; padding: 0;" align="center">
  pr-title
</h1>
<p align="center">
  <img src="https://github.com/clowdhaus/actions/workflows/pr-title/badge.svg" alt="pr-title">
</p>

GitHub action for checking pull request titles against a provided pattern - commonly used to remind users to add Jira ticket IDs to their PR title and/or enforcing semantic titles that follow [conventional-commits](https://www.conventionalcommits.org)

## Usage

```yml
- uses: clowdhaus/actions/pr-title@main
  with:
    # GitHub token which contains access to the repository
    github-token: ${{ secrets.GITHUB_TOKEN }}
    # Regex pattern that PR title is evaluated against
    title-regex: ''
    # Determines whether changes are required when the title does not match the pattern
    on-fail-request-changes: true|false
    # Determines whether a comment should be left when the title does not match the pattern
    on-fail-add-comment: true|false
    # Message posted to user via requested changes or through a comment
    on-fail-message: ''
    # Determines whether the action should be marked as failed when title does not match pattern
    on-fail-fail-action: true|false
```

## Scenarios

### Comment on pull request when the title does not match the default pattern provided

```yml
- uses: clowdhaus/actions/pr-title@main
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Request changes on pull request when the title does not match the pattern provided

```yml
- uses: clowdhaus/actions/pr-title@main
  with:
    title-regex: '^\[JIRA-[0-9]{1,4}]'
    on-fail-request-changes: true
    on-fail-add-comment: false
    on-fail-message: 'Your pull request title does not match the provided pattern: `%regex%`'
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
