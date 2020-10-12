const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const ts = require('gulp-typescript');
const merge = require('merge2');

const tsProject = ts.createProject('tsconfig.json');
gulp.task('default', ['js', 'ts', 'css', 'font', 'interface', 'meta']);
gulp.task('ts', () => {
  const tsResult = gulp.src(['src/actions/**/*.ts', 'src/actions/**/*.tsx']).pipe(tsProject());
  return merge([
    tsResult.dts.pipe(gulp.dest('dist')),
    tsResult.js
      .pipe(
        babel({
          presets: ['react-app'],
          plugins: [
            'transform-es2015-modules-commonjs',
            [
              'import',
              [
                {
                  libraryName: '@lugia/lugia-web',
                  libraryDirectory: 'dist',
                },
                {
                  libraryName: '@lugia/lugia-mega-ui',
                  libraryDirectory: 'dist',
                },
              ],
            ],
          ],
        })
      )
      .pipe(uglify())
      .pipe(gulp.dest('dist')),
  ]);
});
gulp.task('js', () => {
  return gulp
    .src(['src/actions/**/*.js'])
    .pipe(
      babel({
        presets: ['react-app'],
        plugins: [
          'transform-es2015-modules-commonjs',
          [
            'import',
            [
              {
                libraryName: '@lugia/lugia-web',
                libraryDirectory: 'dist',
              },
            ],
          ],
        ],
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
gulp.task('css', () => {
  return gulp.src('src/actions/**/*.css').pipe(gulp.dest('dist'));
});
gulp.task('meta', () => {
  return gulp.src('src/actions/**/*.json').pipe(gulp.dest('dist'));
});
gulp.task('font', () => {
  return gulp
    .src([
      'src/actions/**/*.ttf',
      'src/actions/**/*.eot',
      'src/actions/**/*.svg',
      'src/actions/**/*.png',
      'src/actions/**/*.woff',
      'src/actions/**/*.woff2',
    ])
    .pipe(gulp.dest('dist'));
});
gulp.task('interface', () => {
  return gulp.src(['src/interface/*.js', 'src/interface/*.json']).pipe(gulp.dest('interface'));
});
