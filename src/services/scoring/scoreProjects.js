module.exports=function(report){

    const projects=report.projects||[];

    let score=0;

    if(projects.length>=3)
        score=15;

    else if(projects.length==2)
        score=10;

    else if(projects.length==1)
        score=5;

    return{

        score,

        maxScore:15,

        found:projects.length

    };

}