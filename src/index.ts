import * as fs from 'fs-extra';
import * as path from 'path';
import walk from 'walk-sync';
import stripJsonComments from 'strip-json-comments';
import {execSync,exec} from "child_process";
import convert from "xml-js";
const gamesPath = `C:/Users/L-/Desktop/reverse/lib/games/`;
const libPath = `C:/Users/L-/Desktop/reverse/lib/`;
//当前工作路径
var cwd:string;
function CMD(cmd:string) {
    if (cmd.includes('cd ')) {
        cwd = cmd.replace('cd ', '');
        return;
    }
    const asyncCommand = ['explorer'];
    const noLogTipCommand = ['echo', 'pause', 'ls', 'll', 'explorer'];
    const Cmd = (_cmd:string) => {
        return _cmd.split(' ')[0];
    };
    asyncCommand.indexOf(Cmd(cmd)) === -1 ?
        execSync(cmd, { cwd: cwd,stdio:[0,1,2]}) :
        exec(cmd, { cwd: cwd });
    noLogTipCommand.indexOf(Cmd(cmd)) !== -1 ?
        console.log('---------------------') :
        console.log(cmd + '---------------------finish');

}

function run(){
    const sourceApkPath = libPath+"app-release.apk";
    const reverseOutPath = libPath+"out";
    
//拆包
    // if(fs.existsSync(sourceApkPath)){
    //     console.log(111);
    //     fs.ensureDirSync(reverseOutPath);
    //     const commands = [
    //         `cd ${libPath}`,
    //         `rm -rf ${reverseOutPath}`,
    //         `mkdir out`,
    //         `apktool.bat d -f app-release.apk -o out` 
    //     ];
    //     for (const c of commands) {
    //         CMD(c);
    //     }
    // }
    //games
    const data:{[key:string]:string} = {
        animalchess:"斗兽棋",
        BANG:"BANG"
    };
        
    //转移资源

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            editFiles({gamename:element,id:key});
        }
    }
}
function editFiles(arg:any){
    const gamename = arg.gamename;
    const id = arg.id;
    const commands = [
        `cd ${libPath}`,
        `rm -rf out/assets/game`,
        `cp -r games/${id} out/assets/game`,
        `mv out/assets/game/icon.png out/res/drawable/icon.png` 
    ];
    for (const c of commands) {
        CMD(c);
    }
    const xmlStrings = fs.readFileSync(libPath+'out/res/values/strings.xml',"utf-8");
    const objStrings = convert.xml2js(xmlStrings,{compact:true}) as any;
    objStrings.resources.string._text = gamename;
    const result = convert.js2xml(objStrings,{compact:true});
    

}
run();