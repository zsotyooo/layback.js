module.exports = function(grunt) {
    var jsFiles = [
        'src/lib/*.js',
        'src/tools/*.js',
        'src/core/Layback.js',
        'src/treats/system/*.js',
        'src/treats/*.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        var: {
            packageName: 'layback',
            version: '0.1.1'
        },
        uglify: {
            min: {
                options: {
                    compress: true,
                    mangle: false,
                    beautify: false
                },
                files: {
                    'dist/layback.<%= var.version %>.min.js': jsFiles,
                    'layback.min.js': jsFiles
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
                    'dist/layback.<%= var.version %>.js': jsFiles,
                    'layback.js': jsFiles
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
