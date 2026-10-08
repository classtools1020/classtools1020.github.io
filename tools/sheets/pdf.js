const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const n of process.argv.slice(3)){await p.goto('file://'+process.argv[2]+'/'+n+'.html');await p.waitForTimeout(700);await p.pdf({path:process.argv[2]+'/'+n+'.pdf',preferCSSPageSize:true,printBackground:true});}
await b.close();})();
