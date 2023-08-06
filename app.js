const express       = require('express');
const exphbs        = require('express-handlebars');
const app           = express();
const path          = require('path');
const db            = require('./db/connection');
const bodyParser    = require('body-parser');
const Job           = require('./models/Job');
const Sequelize     = require('sequelize');
const Op            = Sequelize.Op;

const PORT = 3000;

app.listen(PORT, function() {
    console.log(`O Express está rodando na porta ${PORT}`);
});

// body parser
app.use(bodyParser.urlencoded({extended: false}));

// handle bars
app.set('views',  path.join(__dirname, 'views'));           // Diretório das nossas views, templates do projeto
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));  // Arquivo principal de layout (main)
app.set('view engine', 'handlebars');

// static folder
app.use(express.static(path.join(__dirname, 'public')));    // Setando a pasta de arquivos estáticos do projeto

// db connection
db
    .authenticate()
    .then(() => {
        console.log("Conectou ao banco com sucesso!");
    })
    .catch(err => {
        console.log("Ocorreu um erro ao conectar", err);
    });

// routes
app.get('/', (req, res) => {

    let search = req.query.job;
    let query  = '%'+search+'%';                            // PH -> PHP, Word -> WordPress, press -> WordPress

    if(!search){                                            // Se não tiver busca, executa a lógica da home
        Job.findAll({order: [                               // Recupera todos os Jobs do banco por ordem decrescente
            ['createdAt', 'DESC']
        ]})
        .then(jobs => {                                     // No then da promisse retornada, renderiza o index.handlebars, passando os jobs recuperados
    
            res.render('index', {
                jobs
            });
    
        })
        .catch(err => console.log(err));
    } else {
        Job.findAll({
            where: {title: {[Op.like]: query}},             // Utilizando o Op do Sequelize para buscar palavras similares a busca nos titulos dos jobs
            order: [                              
                ['createdAt', 'DESC']
        ]})
        .then(jobs => {                                     

            res.render('index', {
                jobs, search
            });

        });
    }
    


});

// jobs routes
app.use('/jobs', require('./routes/jobs'));
