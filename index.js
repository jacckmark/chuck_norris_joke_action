const github = require("@actions/github");
const core = require("@actions/core");
const axios = require('axios').default;
let nodemailer = require('nodemailer');


async function run() {
    const sendingEmailAddress = core.getInput("githubAccessToken");
    const sendingEmailPass = core.getInput("translationApiToken");
    const sendingEmailProvider = sendingEmailAddress.find(/(?<=@)\w*/);
    const receivingEmailAddress = core.getInput("receivingEmailAddress");
    let transporter = nodemailer.createTransport({
        service: sendingEmailProvider,
        auth: {
            user: sendingEmailAddress,
            pass: sendingEmailPass
        }
    });

    let mailOptions = {
        from: sendingEmailAddress,
        to: receivingEmailAddress,
        subject: 'Some secrets for you',
        text: await getChuckJoke()
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (error) {
            console.error(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

async function getChuckJoke() {
    axios.get('https://api.chucknorris.io/jokes/random').then((resp) => {
        return resp.value;
    }).catch(err => {
        console.error(err)
    });
}

run();