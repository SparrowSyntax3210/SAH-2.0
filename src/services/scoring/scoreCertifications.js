module.exports=function(report){

    const cert=report.certifications||[];

    let score=0;

    if(cert.length>=2)
        score=10;

    else if(cert.length==1)
        score=5;

    return{

        score,

        maxScore:10,

        found:cert.length

    };

}