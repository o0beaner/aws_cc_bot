const Discord = require("discord.io");
const logger = require("winston");
const fs = require("fs");
const aws = require('aws-sdk');
const _ = require('lodash');
const emr = new aws.EMR({region: 'us-east-1'});
const kms = new aws.KMS({region: 'us-east-1'});


const secretPath = '/home/tyler/testEnc';
const encryptedSecret = fs.readFileSync(secretPath);

const params = {
    CiphertextBlob: encryptedSecret
}
kms.decrypt(params, function (err, data) {
    if (err) {
        console.log(err, err.stack)
    } else {
        const decryptedScret = data['Plaintext'].toString();
        console.log(decryptedScret)
    }
});



const varsFile = fs.readFileSync('./envVars.json', 'utf-8',);
const vars = JSON.parse(varsFile);

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true,
    timestamp: true
});

logger.level = 'info';

// Initialize Discord Bot
const bot = new Discord.Client({
    token: vars.dev_authtoken,
    autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(`${bot.username} - (${bot.id})`);
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) === '!') {
        const args = message.substring(1).split(' ');
        const cmd = args[0];
        switch (cmd) {
            case 'ping':
                ping(channelID);
                break;

            case 'launch':
                get_template(channelID)
                break;

        }
    }
});

function ping(channelID) {
    send_message(channelID, "Pong!")
    logger.info('Responding to ping')
}

function send_message(channelID, message_body) {
    bot.sendMessage({
        to: channelID,
        message: message_body
    });
}

function get_template(channelID) {
    fs.readFile('./templates/base.json', 'utf-8', function(err, json) {
        launch_cluster(json, channelID);
    });
}

function launch_cluster(json, channelID) {
    emr.runJobFlow(JSON.parse(json), function(err, response){
        const cluster_id = response.JobFlowId;
        const message_body = `Cluster ${cluster_id} has launched! Back in 90 seconds with connection info...`
        send_message(channelID, message_body);
        logger.info(message_body);
        setTimeout(function() {
            list_groups(cluster_id, channelID);
        }, 90000);
    });
}

function list_groups(cluster_id, channelID) {
    let params = {
        ClusterId: cluster_id
    };

    emr.listInstanceGroups(params, function(err, data){
        const master_group = _.filter(data.InstanceGroups, { 'Name': 'Master' })[0].Id;
        list_instances(cluster_id, master_group, channelID);
    });
}

function list_instances(cluster_id, master_group, channelID) {
    let params = {
        ClusterId: cluster_id,
        InstanceGroupId: master_group
    };
    emr.listInstances(params, function(err, data) {
        const dns_name = data.Instances[0].PublicDnsName;
        print_results(dns_name, cluster_id, channelID);
    });
}

function print_results(dns_name, cluster_id, channelID) {
    let message_body = `Connect to ${cluster_id} via ${dns_name}`;
    logger.info(message_body);
    send_message(channelID, message_body)
}