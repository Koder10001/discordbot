
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var request = require("request");
const {URL, URLSearchParams} = require('url');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: Koder17');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '>') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Bố vẫn còn đây'
                });
            break;
            case "elsword":
                if(args[0]== "online"){
                    fs.unlink(channelID+"-img.txt",()=>{});
                }
                else{
                    fs.writeFile(channelID+"-img.txt","",()=>{})
                    getNews(channelID);
                }
            break;
            case "check":
                getNews(channelID,false);
            break;
            case "say":
                bot.deleteMessage({channelID: channelID,messageID: evt.d.id});
                bot.sendMessage({to: channelID,message: message.substring(4)});
            break;
            case "del":
                bot.deleteMessage({channelID: channelID,messageID: evt.d.id});
            break;
            //debug
            case "new":
                getNews(channelID);
            break;
            // Just add any case commands if you want to..
         }
     }
});

function getNews(id,check = true){
    request({uri:"https://voidels.to/"},(err,res,body)=>{
        bot.sendMessage({to:id,message: "Requesting..."});
        var html = new JSDOM(body);
        var url = html.window.document.querySelector("#left-col > div.left-bg > ul > li:nth-child(1) > div.right > h3 > a").href;
        bot.sendMessage({to:id,message: "Checking on "+ url});
        checkOnline(url,id,check);
    })
}

function checkOnline(url,id, check){
    request({uri: url}, (err, res, body)=>{
        var html = new JSDOM(body);
        stat = html.window.document.querySelector("div.ipsType_normal.ipsType_richText.ipsContained > p:nth-child(1) > img").src;
        stat = new URL(stat);
        stat = stat.searchParams.get("img");
        console.log(check);
        fs.exists(id+"-img.txt",(exists)=>{
            if(!exists){
                fs.writeFile(id+"-img.txt","",()=>{});
            }
            fs.readFile(id+"-img.txt",(err,data)=>{
                if (data!=""){
                    if(data != stat){
                        fs.unlink(id+"-img.txt",()=>{});
                        bot.sendMessage({to:id,message: "Onl rồi mấy má ơiiiiiii @everyone https://i.imgur.com/HhGjkaf.png"});
                    }
                    else {
                        if(check){
                            setTimeout(()=>{
                                checkOnline(url,id,check);
                            }, 60000);
                        }
                        else{
                            bot.sendMessage({to:id,message:"Chưa má"});
                        }
                    }
                }
                else {
                    if(stat.indexOf("HhGjkaf.png") != -1){
                        fs.unlink(id+"-img.txt",()=>{});
                        bot.sendMessage({to:id,message: "Onl rồi mấy má ơiiiiiii @everyone https://i.imgur.com/HhGjkaf.png"});
                    }
                    else {
                        fs.writeFile(id+"-img.txt",stat,()=>{});
                        setTimeout(()=>{
                            checkOnline(url,id,check);
                        }, 60000);
                    }
                }
            })
        })
    })
}