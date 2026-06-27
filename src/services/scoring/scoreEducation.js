module.exports=function(report){

    const edu=report.education||[];

    return{

        score:edu.length?10:0,

        maxScore:10,

        found:edu.length

    };

}