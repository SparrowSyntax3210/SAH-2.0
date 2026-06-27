module.exports=function(report){

    const fields=[

        "name",

        "email",

        "phone",

        "skills",

        "education",

        "projects",

        "experience"

    ];

    let score=0;

    fields.forEach(field=>{

        if(report[field]&&report[field].length!==0)
            score+=2;

    });

    if(score>10)
        score=10;

    return{

        score,

        maxScore:10

    };

}