const core = require('@actions/core');
const github = require('@actions/github');

try {
    const { labels } = github.context.payload.pull_request;
    const versionLabels = labels.filter((l) => l.name.startsWith('version-'));

    // PR requires one version label
    if (versionLabels.length <= 0) {
      throw new Error('PR is missing a version label');
    }

    // PR can not have more than one version label
    if (versionLabels.length > 1) {
      throw new Error('PR can not have more than one version label');
    }

    // PR has one version label
    core.info(`Found version label: ${versionLabels[0].name}`);
} catch (error) {
    core.setFailed(error.message);
}
