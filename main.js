let request=require("request");
let cheerio=require("cheerio");
let fs=require("fs");
let path=require("path");
let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";

request(url,cb);

function cb(error,response,html){
    if(error){
        console.log(error);
    }
    else if(response.statusCode==404){
        console.log("Page Not Found");
    }
    else{
        dataExtracter(html);
        
    }

}
function dataExtracter(html){
    let searchTool=cheerio.load(html);
    let allMatches=searchTool('a[data-hover="View All Results"]');
    let link=allMatches.attr("href");
    let completeUrl="https://www.espncricinfo.com"+link;
    request(completeUrl,allMatchPagecb);
    
}
function allMatchPagecb(error,response,html){
    if(error){
        console.log(error);
    }
    else if(response.statusCode==404){
        console.log("Page Not Found");
    }
    else{
        scoreCardExtracter(html);
        
    }

}
let folderPath=path.join("C:\\Users\\Dell\\Desktop\\pepcoding\\Projects\\project-3_web_scrapping","IPL");
function scoreCardExtracter(html){
   
     let IPLPresent = fs.existsSync(folderPath);
    if (IPLPresent) {
        console.log("File already exist ");
        return;
    }
    fs.mkdirSync(folderPath);
    let searchTool=cheerio.load(html);
    let scoreCard=searchTool('a[data-hover="Scorecard"]');
    for(let i=0;i<scoreCard.length;i++){
        let link=searchTool(scoreCard[i]).attr("href");
        let fullLink="https://www.espncricinfo.com"+link;
        request(fullLink,playerscb);
    }

}
function playerscb(error,response,html){
    if(error){
        console.log(error);
    }
    else if(response.statusCode==404){
        console.log("Page Not Found");
    }
    else{
       player(html);
        
    }

}
function player(html){
    let searchTool=cheerio.load(html);
    let bothInnings=searchTool(".Collapsible");
    
    for(let i=0;i<bothInnings.length;i++){
       let TeamNameElem=searchTool(bothInnings[i]).find("h5");
    
      let TeamName=searchTool(TeamNameElem).text();
      TeamName=TeamName.split("INNINGS")[0];
      let folderpath2 = path.join(folderPath,TeamName);
        let teamPresent = fs.existsSync(folderpath2);
        if (teamPresent) {
        }else{
            fs.mkdirSync(folderpath2);
        }
    //   TeamName=TeamName.trim();
      let batsmanTableAllRows=searchTool(bothInnings[i]).find(".table.batsman tbody tr");
      for(let j=0;j<batsmanTableAllRows.length;j++){
          let numberoftds=searchTool(batsmanTableAllRows[j]).find("td");
         
          if(numberoftds.length==8){
              let playerName=searchTool(numberoftds[0]).text();
              let run=searchTool(numberoftds[2]).text();
              let ball=searchTool(numberoftds[3]).text();
              let four=searchTool(numberoftds[4]).text();
              let six=searchTool(numberoftds[5]).text();
              let strike=searchTool(numberoftds[6]).text();
          
                  
              let stats = [{
                "name" : playerName,
                "runs" : run,
                "balls" : ball,
                "fours" : four,
                "sixes" :six,
                "strikerate" : strike}];

          let jsonstat = JSON.stringify(stats);
        let folderpath3 = path.join(folderpath2,playerName+".json");
        let namePresent = fs.existsSync(folderpath3);
        if (namePresent) {
            let content = fs.readFileSync(folderpath3);
            let jsoncontent = JSON.parse(content);
            jsoncontent.push(stats);
            let mcontent = JSON.stringify(jsoncontent);
            fs.writeFileSync(folderpath3,mcontent);
        }else{
            fs.writeFileSync(folderpath3,jsonstat);
        }
      }
    }
 }


}
