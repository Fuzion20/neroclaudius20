const Discord = require('discord.js');

const client = new Discord.Client();

var prefix = "*";

const ytdl = require('ytdl-core');

const queue = new Map();

var servers = {};

client.login(process.env.TOKEN);

function play(connection, message) {
  var server = servers[message.guild.id];

  server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

  server.queue.shift();

  server.dispatcher.on("end", function() {
    if (server.queue[0]) play(connection, message);

    else connection.disconnect();
  })
}

client.on("ready", () => {
    console.log("Je suis prêt, Master");
    client.user.setGame("*help | commande d'aide");
});

client.on('message', message => {

    if(message.content === "Hein ?"){
        message.reply("2 :P");
        console.log("Le bot aime faire des blagues !")
    }

    if(message.content === prefix + "help"){
        var help_embed = new Discord.RichEmbed()
        .setColor("#C60800")
        .setTitle(`:robot: Liste des catégories `)
        .setDescription(`Les commandes disponibles :`)
        .setThumbnail(message.author.avatarURL)
        .addField(":tools: Modération", "Fais `*mod` pour voir mes commandes de modération !")
        .addField(":tada: Fun", "Fais `*fun` pour voir mes commandes d'animation !")
        .addField(":headphones: Song", "Fais `*song` pour voir mes commandes song !")
        .setFooter("Menu d'aide | Créer par FuziOn")
        .setTimestamp()
        message.channel.send(help_embed);
      }

      if(message.content === prefix + "mod") {
        var mod_embed = new Discord.RichEmbed()
        .setColor('#C60800')
        .setTitle(`:tools: Liste des commandes modérations !`)
        .setThumbnail(message.author.avatarURL)
        .addField("*clear", "Nettoyer le tchat")
        .addField("*mute", "Couper la parole")
        .addField("*unmute", "Redonner la parole")
        .addField("**seewarns", "Voir vos avertissements")
        .addField("*warn", "Mettre un avertissement")
        .addField("*clearwarns", "Supprimer les avertissements")
        .setFooter("Commande modération | Créer par FuziOn")
        .setTimestamp()
        message.channel.send(mod_embed);
      }

      if(message.content === prefix + "song") {
        var song_embed = new Discord.RichEmbed()
        .setColor('#C60800')
        .setTitle(`:tools: Liste des commandes songs !`)
        .setThumbnail(message.author.avatarURL)
        .addField("*play (lien youtube ou marquer le nom de la musique)", "Lancer la musique")
        .addField("*stop", "Stopper la lecture")
        .addField("*next", "Passez une musique")
        .addField("*queue", "Afficher les musiques en attente")
        .setFooter("Commande Song | Créer par FuziOn")
        .setTimestamp()
        message.channel.send(song_embed);
      }

      if(message.content === prefix + "fun") {
        var fun_embed = new Discord.RichEmbed()
        .setColor('#C60800')
        .setTitle(`:tools: Liste des commandes amusantes !`)
        .setThumbnail(message.author.avatarURL)
        .addField("Hein ?", "Le bot, vous répond !")
        .addField("*hug", "Faites vous, des câlins entre vous")
        .addField("*pout", "Vous boudez une personne")
        .addField("*kiss", "Vous faites un bisous")
        .addField("*cry", "Vous pleurez")
        .addField("*eat", "Vous mangez des personnes")
        .addField("*8ball", "Le bot répond à vos question")
        .setFooter("Commandes Fun | Créer par FuziOn")
        message.channel.sendMessage(fun_embed);
    }

    if(message.content.startsWith(prefix + "clear")) {
        if(!message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) return message.channel.send("Vous n'avez pas la permissions !");

        let args = message.content.split(" ").slice(1);

        if(!args[0]) return message.channel.send("Tu dois préciser un nombre de message à supprimer !")
        message.channel.bulkDelete(args[0]).then(() => {
            message.channel.send(`${args[0]} message ont été supprimés !`)
        })
    }

    if(message.content.startsWith(prefix + "mute")) {
        if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR")) return message.channel.send("Vous n'avez pas la permission !");

        if(message.mentions.users.size === 0) {
            return message.channel.send("Vous devez mentionner un utilisateur !");
        }

        var mute = message.guild.member(message.mentions.users.first());
        if(!mute) {
            return message.channel.send("Je n'ai pas trouver l'utilisateur ou il n'existe pas !");
        }

        if(!message.guild.member(client.user).hasPermission("ADMINISTRATOR")) return message.channel.send("Je n'ai pas la permission !");
        message.channel.overwritePermissions(mute, {SEND_MESSAGES: false}).then(member => {
            message.channel.send(`${mute.user.username} est mute !`);
        })
    }

    if(message.content.startsWith(prefix + "unmute")) {
        if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR")) return message.channel.send("Vous n'avez pas la permission !");

        if(message.mentions.users.size === 0) {
            return message.channel.send("Vous devez mentionner un utilisateur !");
        }

        var mute = message.guild.member(message.mentions.users.first());
        if(!mute) {
            return message.channel.send("Je n'ai pas trouver l'utilisateur ou il n'existe pas !");
        }

        if(!message.guild.member(client.user).hasPermission("ADMINISTRATOR")) return message.channel.send("Je n'ai pas la permission !");
        message.channel.overwritePermissions(mute, {SEND_MESSAGES: true}).then(member => {
            message.channel.send(`${mute.user.username} n'est plus mute !`);
        })
    }

    var fs = require('fs');

let warns = JSON.parse(fs.readFileSync("./warns.json", "utf8"));

if (message.content.startsWith(prefix + "warn")){

if (message.channel.type === "dm") return;

var mentionned = message.mentions.users.first();

if(!message.guild.member(message.author).hasPermission("MANAGE_GUILD")) return message.reply("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**").catch(console.error);

if(message.mentions.users.size === 0) {

  return message.channel.send("**:x: Vous n'avez mentionnée aucun utilisateur**");

}else{

    const args = message.content.split(' ').slice(1);

    const mentioned = message.mentions.users.first();

    if (message.member.hasPermission('MANAGE_GUILD')){

      if (message.mentions.users.size != 0) {

        if (args[0] === "<@!"+mentioned.id+">"||args[0] === "<@"+mentioned.id+">") {

          if (args.slice(1).length != 0) {

            const date = new Date().toUTCString();

            if (warns[message.guild.id] === undefined)

              warns[message.guild.id] = {};

            if (warns[message.guild.id][mentioned.id] === undefined)

              warns[message.guild.id][mentioned.id] = {};

            const warnumber = Object.keys(warns[message.guild.id][mentioned.id]).length;

            if (warns[message.guild.id][mentioned.id][warnumber] === undefined){

              warns[message.guild.id][mentioned.id]["1"] = {"raison": args.slice(1).join(' '), time: date, user: message.author.id};

            } else {

              warns[message.guild.id][mentioned.id][warnumber+1] = {"raison": args.slice(1).join(' '),

                time: date,

                user: message.author.id};

            }

            fs.writeFile("./warns.json", JSON.stringify(warns), (err) => {if (err) console.error(err);});

message.delete();

            message.channel.send(':warning: | **'+mentionned.tag+' à été averti**');

message.mentions.users.first().send(`:warning: **Warn |** depuis **${message.guild.name}** donné par **${message.author.username}**\n\n**Raison:** ` + args.slice(1).join(' '))

          } else {

            message.channel.send("Erreur mauvais usage: "+prefix+"warn <user> <raison>");

          }

        } else {

          message.channel.send("Erreur mauvais usage: "+prefix+"warn <user> <raison>");

        }

      } else {

        message.channel.send("Erreur mauvais usage: "+prefix+"warn <user> <raison>");

      }

    } else {

      message.channel.send("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**");

    }

  }

}



  if (message.content.startsWith(prefix+"seewarns")||message.content===prefix+"seewarns") {

if (message.channel.type === "dm") return;

if(!message.guild.member(message.author).hasPermission("MANAGE_GUILD")) return message.reply("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**").catch(console.error);

    const mentioned = message.mentions.users.first();

    const args = message.content.split(' ').slice(1);

    if (message.member.hasPermission('MANAGE_GUILD')){

      if (message.mentions.users.size !== 0) {

        if (args[0] === "<@!"+mentioned.id+">"||args[0] === "<@"+mentioned.id+">") {

          try {

            if (warns[message.guild.id][mentioned.id] === undefined||Object.keys(warns[message.guild.id][mentioned.id]).length === 0) {

              message.channel.send("**"+mentioned.tag+"** n'a aucun warn :eyes:");

              return;

            }

          } catch (err) {

            message.channel.send("**"+mentioned.tag+"** n'a aucun warn :eyes:");

            return;

          }

          let arr = [];

          arr.push(`**${mentioned.tag}** a **`+Object.keys(warns[message.guild.id][mentioned.id]).length+"** warns :eyes:");

          for (var warn in warns[message.guild.id][mentioned.id]) {

            arr.push(`**${warn}** - **"`+warns[message.guild.id][mentioned.id][warn].raison+

            "**\" warn donné par **"+message.guild.members.find("id", warns[message.guild.id][mentioned.id][warn].user).user.tag+"** a/le **"+warns[message.guild.id][mentioned.id][warn].time+"**");

          }

          message.channel.send(arr.join('\n'));

        } else {

          message.channel.send("Erreur mauvais usage: "+prefix+"seewarns <user> <raison>");

          console.log(args);

        }

      } else {

        message.channel.send("Erreur mauvais usage: "+prefix+"seewarns <user> <raison>");

      }

    } else {

      message.channel.send("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**");

    }

  }





  if (message.content.startsWith(prefix+"deletewarns")||message.content===prefix+"deletewarns") {

if (message.channel.type === "dm") return;

if(!message.guild.member(message.author).hasPermission("MANAGE_GUILD")) return message.reply("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**").catch(console.error);

   const mentioned = message.mentions.users.first();

    const args = message.content.split(' ').slice(1);

    const arg2 = Number(args[1]);

    if (message.member.hasPermission('MANAGE_GUILD')){

      if (message.mentions.users.size != 0) {

        if (args[0] === "<@!"+mentioned.id+">"||args[0] === "<@"+mentioned.id+">"){

          if (!isNaN(arg2)) {

            if (warns[message.guild.id][mentioned.id] === undefined) {

              message.channel.send(mentioned.tag+" n'a aucun warn");

              return;

            } if (warns[message.guild.id][mentioned.id][arg2] === undefined) {

              message.channel.send("**:x: Ce warn n'existe pas**");

              return;

            }

            delete warns[message.guild.id][mentioned.id][arg2];

            var i = 1;

            Object.keys(warns[message.guild.id][mentioned.id]).forEach(function(key){

              var val=warns[message.guild.id][mentioned.id][key];

              delete warns[message.guild.id][mentioned.id][key];

              key = i;

              warns[message.guild.id][mentioned.id][key]=val;

              i++;

            });

            fs.writeFile("./warns.json", JSON.stringify(warns), (err) => {if (err) console.error(err);});

            if (Object.keys(warns[message.guild.id][mentioned.id]).length === 0) {

              delete warns[message.guild.id][mentioned.id];

            }

            message.channel.send(`Le warn de **${mentioned.tag}**\': **${args[1]}** a été enlevé avec succès!`);

            return;

          } if (args[1] === "tout") {

            delete warns[message.guild.id][mentioned.id];

            fs.writeFile("./warns.json", JSON.stringify(warns), (err) => {if (err) console.error(err);});

            message.channel.send(`Les warns de **${mentioned.tag}** a été enlevé avec succès!`);

            return;

          } else {

            message.channel.send("Erreur mauvais usage: "+prefix+"clearwarns <utilisateur> <nombre>");

          }

        } else {

          message.channel.send("Erreur mauvais usage: "+prefix+"clearwarns <utilisateur> <nombre>");

        }

      } else {

       message.channel.send("Erreur mauvais usage: "+prefix+"clearwarns <utilisateur> <nombre>");

      }

    } else {

      message.channel.send("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**");

    }

  }

const réponse = JSON.parse(fs.readFileSync('./ball.json', "utf8"));

if (message.content.startsWith(prefix + "8ball")) {

    var args = message.content.split(' ').join(' ');

    if(!args) return message.channel.send("Tu dois me poser une question !")

    var ball_embed = new Discord.RichEmbed()
    .setColor("#C60800")
    .setTitle("Voici ma commande 8Ball :")
    .addField("Question :", `${args}`)
    .addField("Réponse", réponse[Math.round(Math.random() * réponse.length)])
    .setFooter("8Ball | Créer par FuziOn")
    message.channel.send(ball_embed);
  }

  const Discord = require("discord.js");
  const botconfig = require("../botconfig");
  let purple = botconfig.purple;
  let xp = require("../xp.json");
  
  module.exports.run = async (bot, message, args) => {
  
    if(!xp[message.author.id]){
     xp[message.author.id] = {
       xp: 0,
       level: 1
    };
  }
    let curxp = xp[message.author.id].xp;
    let curlvl = xp[message.author.id].level;
    let nxtLvlXp = curlvl * 300;
    let difference = nxtLvlXp - curxp;
  
    let lvlEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setColor(purple)
    .addField("Level", curlvl, true)
    .addField("XP", curxp, true)
    .setFooter(`${difference} XP pour passer le prochain lvl`, message.author.displayAvatarURL);
  
    message.channel.send(lvlEmbed).then(msg => {msg.delete(5000)});
  
  }
  
  module.exports.help = {
    name: "level"
  }
});
