import fs from "fs";
import path from "path";

export const sleep = (timeMS: number) =>
  new Promise<void>((res) => setTimeout(res, 1000));

export function getModelFilePathFromFolder(folderPath: string) {
  return path.resolve(folderPath, "./llm.gguf");
}

export async function llmFileExists(folderPath: string) {
  return fs.existsSync(getModelFilePathFromFolder(folderPath));
}

export function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

const LOGO_IMAGE = `
                                       %&%                                      
                                   @@@****/@@@                                  
                                 ,&%,,@@@@%,*#&.                                
                         #*********,,*@@(@@,,,,,*******%                        
                    /*******%%%%%%@@@,,@@,,#@@&%%%%%%,,,****#                   
                /*****#%%%%%%@@@%%%%@@@,,,@@&%%%&@@@%%%%%%*,,,*,%               
             (,**,/%%%%%%%%%%%%%%%*****,*,,,,,#%%%%%%%%%%%%%%%,,,,,&            
           ,,,,(%%%%%@&%%%%%,,,,**@@@@@@@@@@@@&,,,,,#%%%%%@@%%%%%*,,,,          
         ,,,,%%%@@@%%%%%%,,,(@@@&&&&&&,%@,,&&&&&&&&&,,,*%%%%%%@@@%%%,,,,        
       ,,,,%%%%@@@@%%%%,,*@@@&&&&&&&&,#((#.(&&&%%%%%%%%,,,%%%@@@@%%%%%,,,,      
     /,,,%%%%%%%%%%%%,,,@@&&&,,#&&&&&&&%#@&%%%%%%*,.&###%,,%%%%%%%%%%%%/,,,%    
    ,,,,%%%%@%%%%,,,,,%@@&@@@@@@@@@@%*,,,.,/&@@@@&&&&&&###.,,,,#%%%&@%%%%,,,(   
   ,,,,%%%%%%%%,,*@@,,@&&@@@@*,,,,,@@@@@@@@@@@,,,,,&&&&%((&,,@&,,,%%#%####,,,/  
  ,,,,%%%%@@%%,,@&&&,,@&&@@@,,@@#,,,@@@@@@&&.,#@@,,.#&&%((&..&&#.,,#&@@####,,,% 
 *,,,%%%@@@@##,,&%&&,,@&&@@@/.,,,.,,@@@@@&&&&.......&&&%((&..&%(&..####@%###,,,%
 ,,,##########,,(//&,,@&&@@@@@@@&@@@@@@@&&&&&&&&%&&&&&&#(/&..%/#,.(#########,,,,
 ,,,###########/,.#*,,@&&&@@@@@@@@@@@@@@&&&&&&&&&&&&&&&((/,..##..###@((#@####,,,
%,,,###@#@@@#@####*....@%%%@@@@@@@@@@*,.,,.@&&&&&&&&&(//#,....(#####@(((@####...
%,,,#####@############,.,&%%%%%@@@@@@@@@&&&&&&&&&%(///%#..##############(((#(...
%,,,####################(,..%&%##########(#(((((//&&*...((#((((((((((((((((((..,
 ,,,###%&(#@%%@##(@#########(......../#%%%#/.......,(((((((((#&((@(@@@@#@((((...
 ..,,((#&%%&((@(((((((((((,,,,,,,..@&&@&(((**........,*((((((((((@&&&@@@@(((.../
  ...((((((((((((.,,,,,,,.%&&&@@@@,.,,,,(.....&@@@%###..,.,.....(((((((((((/... 
  #...((((((((((,.&&@@@@@.,,,,(&&&&&@@@@*@@@@#####,,,,,*@@@@@&,..(((&@(((((...# 
   *..,(((((((((,,((((#&&@@@@@#,,,,,%&&&####/,,,,.@@@@@&&/(/(/,./(((((((((...(  
    #...(((((*,,,/@#.,,*((((#&&@@@@@,,,(#...&@@@@&&#/////.,,.%&,...(((((/...#   
      ...,((..(@&&&&&#...(((((((#(#&.,..,....&//////////..@@@&&&#(..,((....     
       /...(.,@&&&&&((/..((((((((((#,.&%(((..///////////..&&&&%((//..*...(      
         ,..,,,&//(//.../((((((((((#.........////////////.../////%.....*        
           /......,.,**/(((((((((((#,.@&&&%..///////////////,&%....../          
              .....//(((((((((((((((.,%((//../////////**/*****.....             
                 ,...../((((((((((((.,&(///..////*********.....,                
                     ,......./((((((..&(///../////**.......*                    
                           ,,........................,(                         
`;

/** https://patorjk.com/software/taag/#p=display&h=1&v=0&f=ANSI%20Shadow&t=AI%20Studybuddy */
const LOGO_TEXT = `
 █████╗ ██╗    ███████╗████████╗██╗   ██╗██████╗ ██╗   ██╗██████╗ ██╗   ██╗██████╗ ██████╗ ██╗   ██╗
██╔══██╗██║    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗╚██╗ ██╔╝██╔══██╗██║   ██║██╔══██╗██╔══██╗╚██╗ ██╔╝
███████║██║    ███████╗   ██║   ██║   ██║██║  ██║ ╚████╔╝ ██████╔╝██║   ██║██║  ██║██║  ██║ ╚████╔╝ 
██╔══██║██║    ╚════██║   ██║   ██║   ██║██║  ██║  ╚██╔╝  ██╔══██╗██║   ██║██║  ██║██║  ██║  ╚██╔╝  
██║  ██║██║    ███████║   ██║   ╚██████╔╝██████╔╝   ██║   ██████╔╝╚██████╔╝██████╔╝██████╔╝   ██║   
╚═╝  ╚═╝╚═╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝    ╚═╝   ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝    ╚═╝   `;

export function printLogo() {
  console.log(LOGO_IMAGE);
  console.log(LOGO_TEXT);
}
