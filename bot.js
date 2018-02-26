const Discord = require("discord.io");
const logger = require("winston");
const fs = require("fs");
const aws = require("aws-sdk");
const _ = require("lodash");
const emr = new aws.EMR({region: "us-east-1"});
const kms = new aws.KMS({region: "us-east-1"});

// Initialize Discord Bot

configureLogging();

function ping(bot, channelID) {
    send_message(bot, channelID, "Pong!");
    logger.info("Responding to ping");
}

function khaled(bot, channelID) {
    fs.readFile("./resources/khaled.txt", "utf-8", function(err, data) {
        let arr = data.split("\n");
        let item = arr[Math.floor(Math.random()*arr.length)];
        let message_body = item;
        send_message(bot, channelID, message_body);
    });
}

function send_message(bot, channelID, message_body) {
    bot.sendMessage({
        to: channelID,
        message: message_body
    });
}

function get_template(bot, channelID) {
    fs.readFile("./templates/base.json", "utf-8", function(err, json) {
        launch_cluster(json, bot, channelID);
    });
}

function launch_cluster(json, bot, channelID) {
    emr.runJobFlow(JSON.parse(json), function(err, response){
        const cluster_id = response.JobFlowId;
        const message_body = `Cluster ${cluster_id} has launched! Back in 90 seconds with connection info...`;
        send_message(bot, channelID, message_body);
        logger.info(message_body);
        setTimeout(function() {
            list_groups(bot, cluster_id, channelID);
        }, 90000);
    });
}

function list_groups(bot, cluster_id, channelID) {
    let params = {
        ClusterId: cluster_id
    };

    emr.listInstanceGroups(params, function(err, data){
        const master_group = _.filter(data.InstanceGroups, { "Name": "Master" })[0].Id;
        list_instances(bot, cluster_id, master_group, channelID);
    });
}

function list_instances(bot, cluster_id, master_group, channelID) {
    let params = {
        ClusterId: cluster_id,
        InstanceGroupId: master_group
    };
    emr.listInstances(params, function(err, data) {
        const dns_name = data.Instances[0].PublicDnsName;
        print_results(bot, dns_name, cluster_id, channelID);
    });
}

function print_results(bot, dns_name, cluster_id, channelID) {
    let message_body = `Connect to ${cluster_id} via ${dns_name}`;
    logger.info(message_body);
    send_message(bot, channelID, message_body)
}

function configureLogging() {
    logger.level = "info";
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
        colorize: true,
        timestamp: true
    });
    decryptEnvVars();

}

function decryptEnvVars() {
    const secretPath = "encEnvVars.json";
    const encryptedSecret = fs.readFileSync(secretPath);

    const params = {
        CiphertextBlob: encryptedSecret
    };
    kms.decrypt(params, function (err, data) {
        if (err) {
            console.log(err, err.stack)
        } else {
            let varString = data["Plaintext"].toString();
            let varObj = JSON.parse(varString);
            botInit(varObj);
        }
    });
}

function botInit(varObj) {

    const bot = new Discord.Client({
        token: varObj.prod_authtoken,
        autorun: true
    });

    bot.on("ready", function (evt) {
        logger.info("Connected");
        logger.info("Logged in as: ");
        logger.info(`${bot.username} - (${bot.id})`);
    });
    botListener(bot);
}

function botListener(bot) {
    bot.on("message", function (user, userID, channelID, message, evt) {
        // Our bot needs to know if it will execute a command
        // It will listen for messages that will start with `!`
        if (message.substring(0, 1) === "!") {
            const args = message.substring(1).split(" ");
            const cmd = args[0];
            switch (cmd) {
                case "ping":
                    ping(bot, channelID);
                    break;

                case "launch":
                    get_template(bot, channelID);
                    break;

                case "fart":
                    send_message(bot, channelID, "that other bot is gross");
                    break;

                case "khaled":
                    khaled(bot, channelID);
                    break;
            }
        }
    });
}