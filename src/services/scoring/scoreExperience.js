module.exports=function(report){

    const exp=report.experience||[];

    let score=0;

    if(exp.length>=2)
        score=20;

    else if(exp.length==1)
        score=12;

    return{

        score,

        maxScore:20,

        found:exp.length

    };

}