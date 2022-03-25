const express = require('express');
const router = express.Router();

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const fs = require('fs');
const path = require('path');
const {shell} = require ('electron');
//library


const arrFilesName = [
    {name:'form2.docx',nameOutput:'Форма2ЧС.docx'},
    {name:'form3.docx',nameOutput:'Форма3ЧС.docx'},
    {name:'info.docx',nameOutput:'Информационное донесение.docx'}
];
arrFilesName.forEach(name=>{
    const content = fs.readFileSync(path.resolve('\\\\192.168.1.4\\Docs\\ЕДДС\\Тренировки\\программа по созданию\\шаблоны', name.name), 'binary');
    name.zip = (new PizZip(content))

})
const pathToSave = '\\\\192.168.1.4\\Docs\\ЕДДС\\Тренировки\\'+new Date().getFullYear()+'\\'
const nameDir = 'Новая тренировка созданная программой'
async function convertDocument(data) {
    fs.mkdir(path.join(pathToSave, nameDir), () => {
        for(const i of arrFilesName){
            const doc = new Docxtemplater();
            doc.loadZip(i.zip);
            //set the templateVariables
            doc.setData(data);
            try {
                doc.render()
            }
            catch (error) {
                // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object).
                const e = {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    properties: error.properties,
                }
                if (error.properties && error.properties.errors instanceof Array) {
                    const errorMessages = error.properties.errors.map(function (error) {
                        return error.properties.explanation;
                    }).join("\n");
                    console.log('errorMessages', errorMessages);
                    // errorMessages is a humanly readable message looking like this :
                    // 'The tag beginning with "foobar" is unopened'
                }
                throw error;
            }
            console.log(__dirname)
            const buf = doc.getZip().generate({type: 'nodebuffer'});
            fs.writeFileSync(path.resolve(pathToSave+nameDir, i.nameOutput), buf);
        }
    });
}

/* GET home page. */
const arrNames=[
    {name : 'date' , text : 'Введите дату(ФОРМАТ день.месяц.год)', header: 'По состоянию на:'},
    {name : 'time' , text : 'Введите время(ФОРМАТ час:минута)'},
    {name : 'nameChs' , text : 'Наименование ЧС', header: 'Общие данные'},
    {name : 'classChs' , text : 'Классификация ЧС'},
    {name : 'source' , text : 'Источник ЧС'},
    {name : 'dateMsk' , text : 'Дата и время возникновения ЧС МСК (час, мин.)'},
    {name : 'locality' , text : 'Населенный(е) пункт(ы)'},
    {name : 'areaZone' , text : 'Площадь зоны ЧС (га)'},
    {name : 'objectName' , text : 'Объект(ы) (наименование)'},
    {name : 'typeOwner' , text : 'Форма собственности'},
    {name : 'affiliation' , text : 'Принадлежность (федеральному органу испол-нительной власти, госкорпорации, субъекту Российской Федерации, муниципальному образова-нию, организации)'},
    {name : 'temperature' , text : 'Температура воздуха (°C)'},
    {name : 'wind' , text : 'Направление и скорость среднего ветра (град., м/с)'},
    {name : 'precipitation' , text : 'Осадки: вид, количество (мм)'},
    {name : 'visibility' , text : 'Видимость (м)'},
    {name : 'factMeteo' , text : 'Фактические метеоусловия(Для информационного донесения)'},
    {name : 'allZonePeople' , text : 'Всего в зоне ЧС (чел.)', header : 'Население'},
    {name : 'childZonePeople' , text : 'в том числе дети (чел.)'},
    {name : 'allPeople' , text : 'Всего (чел.)', header: 'Пострадало'},
    {name : 'allChild' , text : 'В том числе дети (чел.)'},
    {name : 'allDie' , text : 'Погибло (чел.)'},
    {name : 'dieChild' , text : 'В том числе дети (чел.)'},
    {name : 'allHospital' , text : 'Госпитализировано (чел.)'},
    {name : 'hospitalChild' , text : 'В том числе дети (чел.)'},
    {name : 'allDamage' , text : 'Получили ущерб здоровью (чел.)'},
    {name : 'childDamage' , text : 'В том числе дети (чел.)'},
    {name : 'allViolationOfLiving' , text : 'Количество людей с нарушением условий жизнедеятельности (чел.)'},
    {name : 'childViolationOfLiving' , text : 'В том числе дети (чел.)'},
    {name : 'allMedicalHelp' , text : 'Медицинская помощь оказана в амбулаторных условиях (чел.)'},
    {name : 'medicalHelpChild' , text : 'В том числе дети (чел.)'},
    {name : 'generalEnvironment' , text : 'Общая обстановка'},
    {name : 'infoAboutDeadAndInjured' , text : 'Сведения о погибших и пострадавших(Для информационного донесения)'},
    {name : 'nameMeasureProtect' , text : 'Наименование меры по защите населения и территорий от ЧС'},
    {name : 'nameOtherJobs' , text : 'Наименование аварийно-спасательных и других неотложных работ'},
    {name : 'infoAboutDied' , text : 'Дополнительная информация(для формы 2 чс, измените при необходимости)', standard: 'ГБУЗ «Славянская ЦРБ» МЗ КК \n' +
            'г. Славянск-на-Кубани, ул. Бата-рейная, д. 377 \n' + 'Главный врач Просоленко Юрий Александрович \n' + 'раб. тел. 8(86146) 2-20-95, \n' +
            'моб. тел. 8(918) 453-33-83\n' + 'Морг ГБУЗ «Славянская ЦРБ» МЗ КК \n' +
            'Начальник патологоанатомическо-го отделения Асадуллин Альфред Френилович \n' + 'тел. патологоанатомического отде-ления 8(86146) 3-29-76\n'},
    {name : 'character' , text : 'Основные характеристики чрезвычайной ситуации (в ' +
            'зависимости от источника чрезвычайной ситуации)(Редактируйте при необходимости)' ,
        standard : 'город Славянск-на-Кубани общей площадью более 30 кв. км. и населением свыше ше-стидесяти четырёх тысяч человек, на сегодняшний день является районным центром, значимой единицей в развитии Кубани. Он стоит на важных транспортных артериях, через него проходят автодороги на порты гг.Новороссийск, Темрюк, порт Кавказ. Го-род пересекает железнодорожная магистраль. \n' + 'Славянское городское поселение входит в состав МО Славянский район Краснодар-ского края Южного федерального округа Российской Федерации. На западе поселе-ние граничит с Красноармейским МО, граница проходит по реке Протока,  на севере  - с Прибрежным сельским поселением, на востоке – с Прикубанским и Анастасиев-ским сельскими поселениями, на Юге – с Маевским сельским поселением.\n' + 'Координаты 45°10‘16.88\'\' с.ш., 38°10‘00.40\'\' в.д. \n' + 'Климат: умеренно континентальный; \n' + 'средняя температура января - минус 5°C,  средняя температура июля - плюс 23°C. \n' + 'Количество осадков в год – 600 мм.\n'},
    {name : 'additionalData' , text : 'Дополнительные данные(Для формы 2ЧС)'},
    {name : 'additionalMeasures' , text : 'Дополнительные меры(Для формы 3ЧС)'},
];

const arrMonths = ['','января', 'февраля', 'марта', 'апреля','мая', 'июня', 'июля', 'августа','сентября', 'октября', 'ноября', 'декабря'];

router.get('/', function(req, res, next) {
    res.render('index', { arrNames: arrNames });
});


router.post('/form-submit', function(req, res, next) {
    const object = req.body
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
