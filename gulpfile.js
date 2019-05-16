var gulp         = require('gulp'),
	sass         = require('gulp-sass'),
	browserSync  = require('browser-sync'),
	spritesmith = require('gulp.spritesmith'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglifyjs'),
	cssnano      = require('gulp-cssnano'),
	rename       = require('gulp-rename'),
	pug          = require('gulp-pug'),
	del          = require('del'),
	imagemin     = require('gulp-imagemin'),
	pngquant     = require('imagemin-pngquant'),
	cache        = require('gulp-cache'),
	plumber      = require('gulp-plumber'),
	autoprefixer = require('gulp-autoprefixer'),
	gcmq         = require('gulp-group-css-media-queries');

/*_________     Pug Build Html Files (Jade)      ________*/

gulp.task('pug', function() {
        gulp.src('app/pages/**/*.pug')
            .pipe(plumber()) 
            .pipe(pug({pretty: true}))
            .pipe(gulp.dest('app'));

});

/*__________        Build CSS Files              _________*/

gulp.task('sass', function () {
	return gulp.src(['app/sass/**/*.sass', 'app/sass/**/*.scss'])
	.pipe(plumber())
	.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
	.pipe(autoprefixer(['last 15 version', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
	.pipe(gcmq())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}))
});

/*________        Concatenate Js Files            __________*/

gulp.task('scripts', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/bootstrap/dist/js/bootstrap.min.js',
		'app/libs/slick-carousel/slick/slick.min.js'
		])
	.pipe(plumber())
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'));
});

/*________     Build Sprite File        _______*/

gulp.task('sprite', function() {
   var spriteData = gulp.src('app/sprites/*.png') // путь, откуда берем картинки для спрайта
          .pipe(spritesmith({
                algorithm: 'top-down',        //алгоритм створення спрайта top-down left-right  diagonal    alt-diagonal    binary-tree
                padding: 5,                        //отступ між картинками в спрайті
                imgName: 'sprite.png',
				cssName: 'sprite.sass',
				cssFormat: 'sass',
				imgPath: '../img/sprite.png'
          }));
          
    spriteData.img.pipe(gulp.dest('app/img/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('app/sass/')); // путь, куда сохраняем стили  
});

/*________      Minimized LIBS.CSS Files            __________*/

gulp.task('css-libs', ['sass'], function() {
	return gulp.src('app/css/libs.css')
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('app/css'));
});

/*________    Starting  Browser Sync Server        _______*/

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

/*___________       Delete all foldre  dist          ________*/

gulp.task('clean', function() {
	return del.sync('dist');
});

/*___________       Clear Cache files          ________*/

gulp.task('clear', function() {
	return cache.clearAll();
});

/*________      Minimized images            __________*/

gulp.task('img', function() {
	return gulp.src('app/img/**/**.*')
	.pipe(cache(imagemin({
		interlased: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img'));
});

/*__________         Watcher Files         __________*/

gulp.task('watch',['browser-sync', 'css-libs', 'scripts'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch('app/pages/**/*.pug', ['pug']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

/*_______    Production  Project Build      ________*/

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {
	var cssBuild = gulp.src([
		'app/css/libs.min.css',
		'app/css/fonts.css',
		'app/css/main.css'				
	])
	.pipe(gulp.dest('dist/css'));

	var fontsBuild = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'));

	var jsBuild = gulp.src('app/js/**/*')
	.pipe(gulp.dest('dist/js'));

	var htmlBuild = gulp.src([
		'app/**.html',
		'app/**.php',
		'app/.htaccess'
	])
	.pipe(gulp.dest('dist'));
});