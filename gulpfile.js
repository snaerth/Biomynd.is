"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect'); // Runs a local dev server
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
var concat = require('gulp-concat'); // Concats files
var cleanCSS = require('gulp-clean-css'); // Minifyies and cleans css
var sourcemaps = require('gulp-sourcemaps');  // Generates source maps
var minify = require('gulp-minify');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var server = require('gulp-express');

var config = {
	port : 4000,
	devBaseUrl : 'http://localhost',
	paths : {
		html : ['./src/*.html','./src/**/*.html'],
		move : [
			'./src/',
			'./src/**/*',
		],
		js : './src/**/*.js',
		css : [
			'./src/css/animate.css',
			'./src/css/photoswipe.css',
			'./src/css/photoswipe-default-skin.css',
			'./src/css/netflix-component.css',
			'./src/css/style.css',
			'./src/css/cs-select.css',
			'./src/css/ui-search.css',
			'./src/css/ie-only.css'
		], 
		public : './public',
		mainJs : './src/js/app.js',
		scripts : [
			'./src/js/lib/lscache.min.js',
			'./src/js/lib/jquery-3.0.0.min.js',
			'./src/js/lib/modernizr.custom.js',
			'./src/js/lib/classie.js',
			'./src/js/lib/selectFx.js',
			'./src/js/lib/photoswipe.min.js',
			'./src/js/lib/photoswipe-ui-default.min.js',
			'./src/js/lib/angular.min.js',
			'./src/js/lib/angular-route.min.js',
			'./src/js/lib/angular-touch.min.js',
			'./src/js/lib/custom.prototypes.js',
			'./src/js/app.js',
			'./src/js/**/*.module.js',
			'./src/js/**/*.js'
		]
	}
};

gulp.task('html', function() {
	gulp.src(config.paths.html)
		.pipe(gulp.dest(config.paths.public))
		.pipe(connect.reload());
});

gulp.task('move', function() {
	gulp.src(config.paths.move, { base: 'src/' })
		.pipe(gulp.dest(config.paths.public))
		.pipe(connect.reload());
});

gulp.task('js', function() {
	gulp.src(config.paths.scripts)
		.on('error', console.error.bind(console))
		.pipe(concat('bundle.js'))
		.pipe(minify())
		.pipe(gulp.dest(config.paths.public + '/js'))
});

gulp.task('css', function() {
	gulp.src(config.paths.css)
		.pipe(concat('bundle.css'))
		.pipe(autoprefixer())
		.pipe(cleanCSS())
		.pipe(minify())
		.pipe(gulp.dest(config.paths.public + '/css'))
		.pipe(connect.reload());
});

gulp.task('eslint', function() {
	return gulp.src(config.paths.js)
		.pipe(eslint({config : 'eslint.config.json'}))
		.pipe(eslint.format());
});

gulp.task('watch', function() {
	gulp.watch(config.paths.html, ['html']);
	gulp.watch(config.paths.js, ['js']);
	gulp.watch(config.paths.css, ['css']);
});

gulp.task('server', function () {
    // Start the server at the beginning of the task 
    server.run(['server.js']);
     // Restart the server when file changes
	gulp.watch(['public/index.ejs'], server.notify); 
    gulp.watch(['public/**/*.html'], server.notify);
    gulp.watch(['public/css/**/*.css'], server.notify);
    gulp.watch(['public/js/**/*.js'], server.notify);
    gulp.watch(['public/images/**/*'], server.notify);
});


gulp.task('default', ['eslint','move','html','js','css','watch']);