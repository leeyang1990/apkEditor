import * as path from 'path';
import {execSync,exec} from "child_process";

//当前工作路径
export var cwd:string;
export function CMD(cmd:string) {
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
export function CMDS(cmds:string[]){
    for (const cmd of cmds) {
        CMD(cmd);
    }
}
export function unpack(apk:string,out:string){
    const libpath = path.join(__dirname,"../lib");
    const commands = [
        `cd ${libpath}`,
        `apktool.bat d -f ${apk} -o ${out}` 
    ];
    CMDS(commands);
}
export function packandsign(src:string,out:string,keystore:{file:string,alias:string,storepass:string,keypass:string}){
    const libpath = path.join(__dirname,"../lib");
    const commands = [
        `cd ${libpath}`,
        `apktool.bat b ${src} -o unsigned.apk`,
        `jarsigner -verbose -keystore ${keystore.file} -signedjar ${out} unsigned.apk  key0 -storepass "${keystore.storepass}" -keypass "${keystore.keypass}"`
    ];
    CMDS(commands);
}
