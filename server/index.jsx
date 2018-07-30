import express from 'express';
import yields from 'express-yields';
import fs from 'fs-extra';
import webpack from 'webpack';
import { argv } from 'optimist';
import { questions, question } from '../data/api-real-url';
import { get } from 'request-promise';
import { delay } from 'redux-saga';

const port = process.env.Port || 3000;
const app = express();

/*get the argument from argv */
const useLiveData = argv.useLiveData === 'true';

/*get generator data from a function*/
function * getQuestions(){
    let data;
    if (useLiveData) {
        data = yield get(questions,{gzip:true});
    } else {
       data = yield fs.readFile('./data/mock-questions.json',"utf-8");
    }
    /* parse the data and return it */
    return JSON.parse(data);
}

/*handler and routes to manage single data */
function * getQuestion (question_id) {
    let data;
    if (useLiveData) {
        /**
         * If live data is used, contact the external API
         */
        data = yield get(question(question_id),{gzip:true,json:true});
    } else {
        /**
         * If live data is not used, get the list of mock questions and return the one that
         * matched the provided ID
         */
        const questions = yield getQuestions();
        const question = questions.items.find(_question=>_question.question_id == question_id);
        /**
         * Create a mock body for the question
         */
        question.body = `Mock question body: ${question_id}`;
        data = {items:[question]};
    }
    return data;
}

/* api route to handle this function */
app.get('/api/questions',function * (req,res){
    const data = yield getQuestions();
    yield delay(150);
    res.json(data);
});

app.get('/api/questions/:id',function * (req,res){
    const data = yield getQuestion(req.params.id);
    yield delay(150);
    res.json(data);
});

if (process.env.NODE_ENV === 'development') {
    const config = require('../webpack.config.dev.babel').default;
    const compiler = webpack(config);

    app.use(require('webpack-dev-middleware') (compiler, {
        noInfo:true
    }));

    app.use(require('webpack-hot-middleware') (compiler));
}

app.get(['/'], function* (req, res) {
    const index = yield fs.readFile('./public/index.html', 'utf-8');
    res.send(index);
});

app.listen(port, '0.0.0.0', () => console.info(`App listening on ${port}`));
