const assert = require('assert');
const apkeditor = require('../dist');
const convert = require("xml-js");
const path = require('path');
const fs = require('fs-extra');
//games 
const games = JSON.parse(fs.readFileSync(path.join(__dirname,"games.json"),"utf-8"));

function editFiles(arg,tempout) {
    const gamename = arg.gamename;
    const id = arg.id;
    const commands = [
        `cd ${__dirname}`,
        `rm -rf ${tempout}/assets/game`,
        `cp -r ${path.join(__dirname,"games",id)} ${path.join(tempout,"assets/game")}`,
        `mv ${path.join(__dirname,"tempout/assets/game/icon.png")} ${path.join(__dirname,"tempout/res/drawable/icon.png")}`
    ];
    apkeditor.CMDS(commands);
    const xmlStrings = fs.readFileSync(path.join(__dirname,'tempout/res/values/strings.xml'), "utf-8");
    const objStrings = convert.xml2js(xmlStrings, {
        compact: true
    });
    objStrings.resources.string._text = gamename;
    const resultStrings = convert.js2xml(objStrings, {
        compact: true
    });
    fs.writeFileSync(path.join(__dirname,'tempout/res/values/strings.xml'), resultStrings, {
        encoding: "utf-8"
    });

    const xmlAndroidManifest = fs.readFileSync(path.join(__dirname,'tempout/AndroidManifest.xml'), 'utf-8');
    const objAndroidManifest = convert.xml2js(xmlAndroidManifest, {
        compact: true
    });
    objAndroidManifest.manifest._attributes.package = `com.egret.${id}`;
    const resultAndroidManifest = convert.js2xml(objAndroidManifest, {
        compact: true
    });
    fs.writeFileSync(path.join(__dirname,'tempout/AndroidManifest.xml'), resultAndroidManifest, {
        encoding: "utf-8"
    });
}

function run() {
    //unpack
    const apk = path.join(__dirname, "app-release.apk");
    const tempout = path.join(__dirname, "tempout");
    if(!fs.existsSync(tempout)){
        apkeditor.unpack(apk,tempout);
    }
    //edit
    const games = {
        animalchess:"斗兽棋",
        BANG:"BANG"
    }
    fs.ensureDirSync(path.join(__dirname,"outapks"))
    for (const key in games) {
        if (games.hasOwnProperty(key)) {
            editFiles({gamename:games[key],id:key},tempout);
            //packandsign
            const keystore = {
                file:path.join(__dirname,"keystore.jks"),
                alias:"key0",
                storepass:"android",
                keypass:"android"
            }
            const src = tempout;
            const out = path.join(__dirname,"outapks",games[key]+".apk");
            apkeditor.packandsign(src,out,keystore);
        }
    }
    //
}
run();

// describe('test', function () {
//         it('egret unpack', (done) => {

            
//             //   assert.equal(result[0], `result0`);
//         });

// });