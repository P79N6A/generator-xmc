'use strict';
// var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
// var yosay = require('yosay');
var chalk = require('chalk');
var template = require('template');

// 获取仓库目录名
function getReposName(that) {
  var root = that.env.cwd;
  return path.basename(root);
}

var userName = require('git-user-name');
var userMail = require('git-user-email');

var XmcGenerator = yeoman.generators.Base.extend({
  initializing: function() {
    this.pkg = require('../package.json');
  },

  prompting: function() {
    var done = this.async();
    this.reposName = getReposName(this);

    this.log(chalk.bold.cyan('> 欢迎使用kissy 项目构建工具xmc!'), '', chalk.yellow('v' + this.pkg.version));
    //@see:https://github.com/SBoudrias/Inquirer.js
    var prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: chalk.yellow('项目名称'),
        default: this.reposName,
      },
      {
        type: 'input',
        name: 'packageName',
        message: chalk.yellow('KISSY PackageName'),
        default: this.reposName,
        validate: function(input) {
          var done = this.async();
          if (!/\b[-a-z]+\b/.test(input)) {
            done(chalk.red('Error: ') + chalk.gray('required ') + chalk.magenta('[-a-z]'));
            return;
          }
          done(true);
        },
      },
      {
        name: 'description',
        message: chalk.yellow('项目介绍'),
        default: this.reposName + '是',
      },
      {
        type: 'input',
        name: 'version',
        message: chalk.yellow('项目版本'),
        default: '1.0.0',
        validate: function(input) {
          var done = this.async();
          if (!/^\d+\.\d+\.\d+$/.test(input)) {
            done(chalk.red('Error: ') + chalk.gray('version required x.y.z'));
            return;
          }
          done(true);
        },
      },
      {
        type: 'list',
        name: 'style',
        message: chalk.yellow('样式语言'),
        default: 'scss',
        choices: ['scss', 'less'],
      },
      {
        name: 'author',
        message: chalk.yellow('作者名'),
        default: userName || 'yourname',
      },
      {
        name: 'email',
        message: chalk.yellow('邮箱地址'),
        default: userMail || 'yourname@alibaba-inc.com',
      },
      {
        name: 'repo',
        message: chalk.yellow('gitLab仓库地址'),
        default: null,
      },
    ];

    this.prompt(
      prompts,
      function(props) {
        this.prompts = {};
        this.prompts.projectName = props.projectName;
        this.prompts.packageName = props.packageName;
        this.prompts.description = props.description;
        this.prompts.style = props.style;
        this.prompts.version = props.version;
        this.prompts.author = {
          name: props.author,
          email: props.email,
        };
        this.prompts.repository = {
          url: props.repo,
        };

        done();
      }.bind(this),
    );
  },

  writing: {
    app: function() {
      this.dest.mkdir('src');
      this.dest.mkdir('src/common');
      this.dest.mkdir('src/home');
      this.dest.mkdir('src/home/images');
      this.dest.mkdir('src/home/mods');
      this.dest.mkdir('src/home/views');

      var indexTemp = this.src.read('index.js');
      this.dest.write('src/home/index.js', template(indexTemp, this.prompts));
      var modTemp = this.src.read('mod.js');
      this.dest.write('src/home/mods/a.js', template(modTemp, this.prompts));
      this.src.copy('views.xtpl', 'src/home/views/hello.xtpl');
    },

    style: function() {
      if (this.prompts.style === 'scss') {
        this.dest.mkdir('src/home/scss');
        this.dest.mkdir('src/home/images/i');
        this.src.copy('scss/fav.png', 'src/home/images/i/fav.png');
        this.src.copy('scss/faved.png', 'src/home/images/i/faved.png');
        this.src.copy('scss/index.scss', 'src/home/index.scss');
        this.src.copy('scss/_sprites.scss', 'src/home/images/_sprites.scss');
      } else {
        this.dest.mkdir('src/home/less');
        this.src.copy('less/index.less', 'src/home/index.less');
      }
    },

    projectfiles: function() {
      this.src.copy('editorconfig', '.editorconfig');
      this.src.copy('jshintrc', '.jshintrc');
      this.src.copy('gitignore', '.gitignore');
    },

    packageJSON: function() {
      var packageTemp = this.src.read('_package.json');
      // var bowerTemp = this.src.read('_bower.json');
      this.dest.write('package.json', template(packageTemp, this.prompts));
      // this.dest.write('bower.json', template(bowerTemp, this.prompts))
    },

    gulpfiles: function() {
      if (this.prompts.style === 'scss') {
        this.src.copy('scss/gulpfile', 'gulpfile.js');
      } else {
        this.src.copy('less/gulpfile', 'gulpfile.js');
      }
    },

    demofiles: function() {
      this.dest.mkdir('demo');
      var demoTemp = this.src.read('demo.html');
      this.dest.write('demo/home.html', template(demoTemp, this.prompts));
    },
  },

  end: function() {
    //this.installDependencies();
    this.log(chalk.bold.green('> 初始化完毕'));
    this.log('> 运行 ' + chalk.bold.yellow('npm install') + ' 安装项目依赖');
    this.log('> 运行 ' + chalk.bold.yellow('yo xmc:page') + ' 创建页面');
    this.log('> 运行 ' + chalk.bold.yellow('yo xmc -h') + ' 查看帮助');
  },
});

module.exports = XmcGenerator;
