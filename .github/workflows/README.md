# GitHub Actions Workflows

## sync-check.yml

Automated workflow that runs daily to check if `create-fred` is in sync with `fred`:

- Checks for version mismatches
- Validates template compatibility
- Tests that templates can import from latest fred
- Reports sync status

### Manual Trigger

You can also trigger this workflow manually from the Actions tab.

### Setup

Make sure the `fred` repository is accessible. The workflow uses `GITHUB_TOKEN` by default, which works for public repos. For private repos, you may need to set up a personal access token.

