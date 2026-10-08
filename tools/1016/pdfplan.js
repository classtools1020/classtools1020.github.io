const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const [n,o] of [['plan_sub','/home/user/sports-results/f8f9fc3bd1/plan.pdf'],['plan_ct','/home/user/classtools1020.github.io/light-refract/1016/plan.pdf']]){await p.goto('file://'+process.cwd()+'/'+n+'.html');await p.waitForTimeout(400);await p.pdf({path:o,format:'A4',printBackground:true,preferCSSPageSize:true});}
await b.close();})();
