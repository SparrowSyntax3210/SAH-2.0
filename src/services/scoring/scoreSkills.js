module.exports = function(report){

    const skills = report.skills || [];

    let score = 0;

    if(skills.length>=12)
        score=20;

    else if(skills.length>=8)
        score=16;

    else if(skills.length>=5)
        score=12;

    else if(skills.length>=3)
        score=8;

    else
        score=4;

    return{

        score,

        maxScore:20,

        found:skills.length

    };

}