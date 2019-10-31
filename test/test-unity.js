const assert = require('assert');
const apkeditor = require('../dist');
const convert = require("xml-js");
const path = require('path');
const fs = require('fs-extra');
const stripJsonComments = require('strip-json-comments');
//config
const config = JSON.parse(stripJsonComments(fs.readFileSync(path.join(__dirname,"config.json"),'utf-8'))); 
const games = JSON.parse(stripJsonComments(fs.readFileSync(path.join(__dirname,"games.json"),'utf-8'))); 



function editFiles(arg,tempout,ab,icon) {
    const gamename = arg.gamename;
    const id = arg.id;
    const commands = [
        `cd ${__dirname}`,
        `cp ${ab} ${path.join(tempout,"assets/demo")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-hdpi/app_icon.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-hdpi/app_icon_round.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-ldpi/app_icon.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-ldpi/app_icon_round.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-mdpi/app_icon.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-mdpi/app_icon_round.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-xhdpi/app_icon.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-xhdpi/app_icon_round.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-xxhdpi/app_icon.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-xxhdpi/app_icon_round.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-xxxhdpi/app_icon.png")}`,
        `cp ${icon} ${path.join(tempout,"res/mipmap-xxxhdpi/app_icon_round.png")}`,
    ];
    apkeditor.CMDS(commands);
    const xmlStrings = fs.readFileSync(path.join(tempout,'res/values/strings.xml'), "utf-8");
    const objStrings = convert.xml2js(xmlStrings, {
        compact: true
    });
    objStrings.resources.string[0]._text = gamename;
    const resultStrings = convert.js2xml(objStrings, {
        compact: true
    });
    fs.writeFileSync(path.join(tempout,'res/values/strings.xml'), resultStrings, {
        encoding: "utf-8"
    });

    const xmlAndroidManifest = fs.readFileSync(path.join(tempout,'AndroidManifest.xml'), 'utf-8');
    const objAndroidManifest = convert.xml2js(xmlAndroidManifest, {
        compact: true
    });
    objAndroidManifest.manifest._attributes.package = `com.demo.${id}`;
    const resultAndroidManifest = convert.js2xml(objAndroidManifest, {
        compact: true
    });
    fs.writeFileSync(path.join(tempout,'AndroidManifest.xml'), resultAndroidManifest, {
        encoding: "utf-8"
    });
}

function run() {
    console.log(games);
    //unpack
    const apk = config.apk;
    const tempout = config.tempout;
    if(!fs.existsSync(tempout)){
        apkeditor.unpack(`"${apk}"`,`"${tempout}"`);
    }
    fs.ensureDirSync(config.outapks);
    for (const key in games) {
        if (games.hasOwnProperty(key)) {
            //edit
            const abpath = path.join(config.abs,key);
            const iconpath = path.join(config.icons,key)+".png";
            editFiles({gamename:games[key],id:key},tempout,abpath,iconpath);
            //packandsign
            const keystore = config.keystore;
            const src = tempout;
            const out = path.join(config.outapks,games[key]+".apk");
            apkeditor.packandsign(src,out,keystore);
        }
    }
}
run();

// describe('test', function () {
//         it('egret unpack', (done) => {

            
//             //   assert.equal(result[0], `result0`);
//         });

// });