const github = require("@actions/github");
const core = require("@actions/core");
const axios = require('axios').default;

async function run() {
    const githubAccessToken = core.getInput("githubAccessToken");
    const translationApiToken = core.getInput("translationApiToken");
    await replaceGithubComments(translationApiToken, githubAccessToken);
}

async function getYodaTranslation(textToTranslate, translationApiToken) {
    try {
        const response = await axios.get(`https://api.funtranslations.com/translate/yoda.json`, {
            headers: prepareHeaders(translationApiToken),
            params: prepareParams(textToTranslate)
        })
        return response.data.contents.translated;
    } catch (err) {
        console.error(err);
    }
}

async function replaceGithubComments(translateApiToken, githubToken) {
    const { eventName, payload, repo } = github.context;
    const octokit = github.getOctokit(githubToken);
    if (eventName === 'issue_comment' || eventName === 'pull_request_review_comment') {
        // console.log(payload);
        const comment = payload.comment.body;
        console.log('111111111111111111111111111111111111111111111111111111');
        const result = await getYodaTranslation(comment, translateApiToken);
        console.log('222222222222222222222222222222222222222222222222222222');
        console.log(result);
        octokit.issues
            .updateComment({ ...repo, comment_id: payload.comment.id, result })
            .then(() => core.info("Translated comment to yodish..."))
            .catch((error) => core.error(error));
    }
}

function prepareParams(textToTranslate) {
    if (textToTranslate) {
        return { 'text': textToTranslate };
    }
}

function prepareHeaders(apiToken) {
    if (apiToken) {
        return {
            'X-FunTranslations-Api-Secret': apiToken
        }
    }
}

run();
