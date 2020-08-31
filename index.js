const github = require("@actions/github");
const core = require("@actions/core");
const axios = require('axios').default;
const { eventName, payload, repo } = github.context;

async function run() {
    const githubAccessToken = core.getInput("githubAccessToken");
    const translationApiToken = core.getInput("translationApiToken");
    replaceGithubComments(translationApiToken, githubAccessToken);
}

async function getYodaTranslation(textToTranslate, translationApiToken) {
    try {
        const response = await axios.get(`https://api.funtranslations.com/translate/yoda.json${prepareParams(textToTranslate)}`, {
            headers: prepareHeaders(translationApiToken)
        })
        return response.data;
    } catch (err) {
        console.error(err);
    }
}

function prepareParams(textToTranslate) {
    let urlSearchParams = new URLSearchParams();

    if (textToTranslate) {
        urlSearchParams.append('text', textToTranslate);
    }
    return `?${urlSearchParams.toString()}`
}

function prepareHeaders(apiToken) {
    if (apiToken) {
        return {
            'X-FunTranslations-Api-Secret': apiToken
        }
    }
}

function replaceGithubComments(translateApiToken, githubToken) {
    const octokit = github.getOctokit(githubToken);
    if (eventName === 'issue_comment' || eventName === 'pull_request_review_comment') {
        const comment = payload.comment.body;
        const result = await getYodaTranslation(comment, translateApiToken);
        octokit.issues
            .updateComment({ ...repo, comment_id: payload.comment.id, result })
            .then(() => core.info("Translated comment to yodish..."))
            .catch((error) => core.error(error));
    }
}

run();
