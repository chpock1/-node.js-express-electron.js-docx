const express = require('express');
const router = express.Router();
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const {shell} = require ('electron');
import {arrFilesName,arrNames,arrSubCat,arrMonths} from '../data/data'

arrFilesName.forEach(name=>{
    const content = fs.readFileSync(path.resolve('\\\\192.168.1.4\\Docs\\ЕДДС\\7 Тренировки\\программа по созданию\\шаблоны', name.name), 'binary');
    name.zip = (new PizZip(content))

})
const pathToSave:string = '\\\\192.168.1.4\\Docs\\ЕДДС\\7 Тренировки\\'+new Date().getFullYear()+'\\'
const nameDir:string = 'Новая тренировка созданная программой'
async function convertDocument(data:{[key:string]:string}) {
    fs.mkdir(path.join(pathToSave, nameDir), ():void => {
        for(const i of arrFilesName){
            const doc = new Docxtemplater();
            doc.loadZip(i.zip);
            //set the templateVariables
            doc.setData(data);
            try {
                doc.render()
            }
            catch (error: any) {
                // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object).
                const e = {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    properties: error.properties,
                }
                if (error.properties && error.properties.errors instanceof Array) {
                    const errorMessages = error.properties.errors.map(function (error: any) {
                        return error.properties.explanation;
                    }).join("\n");
                    console.log('errorMessages', errorMessages);
                    // errorMessages is a humanly readable message looking like this :
                    // 'The tag beginning with "foobar" is unopened'
                }
                throw error;
            }
            const buf = doc.getZip().generate({type: 'nodebuffer'});
            fs.writeFileSync(path.resolve(pathToSave+nameDir, i.nameOutput), buf);
        }
    });
}

router.get('/', function(req: any, res: any): void {
    res.render('index');
});
router.get('/subCat/:id',(req: any,res: any)=>{
    const id:number=req.params.id*1;
    res.render('selectSubCat', { numb:id, arrSubCat: arrSubCat.filter(a=>a.type===id) });
});
router.get('/cat/:numb/:id',(req: any,res: any)=>{
    const {id,numb}=req.params;
    const object = arrNames;
    if(arrSubCat[id].generalEnvironment){
        object[0].standard =  arrSubCat[id].generalEnvironment
    }
    if(arrSubCat[id].infoAboutDeadAndInjured){
        object[31].standard =  arrSubCat[id].infoAboutDeadAndInjured
    }
    res.render('form', {numb, arrNames:object});
});

router.post('/form-submit', function(req: any, res: any) {
    const object = req.body
    object.training = object.training==='on'?'По тренировке':''
    object.dateWithMonth = object.date.replace('.'+object.date.split('.')[1]+'.',' '+arrMonths[object.date.split('.')[1]*1]+' ')
    object.additionalTextInfo=object.generalEnvironment +' '+object.infoAboutDeadAndInjured
    object.additionalInfo=object.additionalTextInfo+' '+object.nameMeasureProtect+' '+object.nameOtherJobs
    convertDocument (object).then (() => {
        const {shell} = require('electron')
        shell.showItemInFolder(pathToSave + nameDir)
        res.send ('Сохранено в папку' + pathToSave + nameDir + '<br> Необходимо переименовать');
    })
});

module.exports = router;
