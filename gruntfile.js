module.exports = function(grunt) {
    var jsFiles = [
        'js/src/lib/*.js',
        'js/src/tools/*.js',
        'js/src/core/Layback.js',
        'js/src/treats/system/*.js',
        'js/src/treats/*.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        var: {
            packageName: 'layback',
            version: '0.1.0'
        },
        uglify: {
            min: {
                options: {
                    compress: true,
                    mangle: false,
                    beautify: false
                },
                files: {
                    'js/layback.<%= var.version %>.min.js': jsFiles
                }
            },
            dev: {
                options: {
                    compress: false,
                    mangle: false,
                    beautify: true,
                    preserveComments: 'some'
                },
                files: {
                    'js/layback.<%= var.version %>.js': jsFiles
                }
            }
        },
        watch: {
            js: {
                files: jsFiles,
                tasks: ['uglify']
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
