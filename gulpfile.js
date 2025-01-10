const { src, dest } = require('gulp');

function copyIcons() {
	return src('nodes/**/*.svg').pipe(dest('dist/nodes'));
}

exports.build = copyIcons;
exports['build:icons'] = copyIcons; 