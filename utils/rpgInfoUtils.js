const { fs } = require('fs');


exports.getClassData = function(className) {
    const classes = fs.readFileSync('./data/classes.json');
    let classesObject = JSON.parse(classes);

    console.log(classesObject);

    return classesObject;
}