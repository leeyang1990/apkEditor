const assert = require('assert');
const apkeditor = require('../dist');
const convert = require("xml-js");
const path = require('path');
const fs = require('fs-extra');
const stripJsonComments = require('strip-json-comments');
//config
const config = JSON.parse(stripJsonComments(fs.readFileSync(path.join(__dirname,"config-egret.json"),'utf-8'))); 
const games = JSON.parse(stripJsonComments(fs.readFileSync(path.join(__dirname,"games-egret.json"),'utf-8'))); 


function editFiles(arg,tempout,src) {
    const gamename = arg.gamename;
    const id = arg.id;
    const commands = [
        `cd ${__dirname}`,
        `rm -rf ${tempout}/assets/game`,
        `cp -r ${src} ${path.join(tempout,"assets/game")}`,
        `mv ${path.join(tempout,"assets/game/icon.png")} ${path.join(tempout,"res/drawable/icon.png")}`
    ];
    apkeditor.CMDS(commands);
    const xmlStrings = fs.readFileSync(path.join(tempout,'res/values/strings.xml'), "utf-8");
    const objStrings = convert.xml2js(xmlStrings, {
        compact: true
    });
    console.log(JSON.stringify(objStrings));
    //根据情况设置app_name,一般为第一个索引
    if(Array.isArray(objStrings.resources.string)){
        objStrings.resources.string[0]._text = gamename;
    }else{
        objStrings.resources.string._text = gamename;
    }
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
    objAndroidManifest.manifest._attributes.package = `com.egret.${id}`;
    const resultAndroidManifest = convert.js2xml(objAndroidManifest, {
        compact: true
    });
    fs.writeFileSync(path.join(tempout,'AndroidManifest.xml'), resultAndroidManifest, {
        encoding: "utf-8"
    });
}
function copyImage(){
    const images = config.images;

    for (const key in games) {
        if (games.hasOwnProperty(key)) {
            const element = games[key];
            const imageElement = path.join(images,element);
            if(!fs.existsSync(imageElement)){
                continue;
            }
            const commands = [
                `cp -r ${imageElement+"/bg.jpg"} ${gameassets+key+"/bg.jpg"}`,
                `cp -r ${imageElement+"/icon.png"} ${gameassets+key+"/icon.png"}`,
            ]
            apkeditor.CMDS(commands);
        }
    }
}
function run() {
    // copyImage();
    const gameassets = config.gameassets;
    console.log(games);
    //unpack
    const apk = config.apk;
    const tempout = config.tempout;
    if(!fs.existsSync(tempout)){
        apkeditor.unpack(apk,tempout);
    }
    fs.ensureDirSync(config.outapks);
    for (const key in games) {
        if (games.hasOwnProperty(key)) {
            //edit
            editFiles({gamename:games[key],id:key},tempout,path.join(gameassets,key));
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