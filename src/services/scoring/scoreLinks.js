module.exports=function(report){

    let score=0;

    if(report.github)
        score+=2;

    if(report.linkedin)
        score+=2;

    if(report.portfolio)
        score+=1;

    return{

        score,

        maxScore:5

    };

}