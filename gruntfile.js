module.exports = function(grunt) {
    var jsFiles = [
        'src/lib/*.js',
        'src/tools/*.js',
        'src/core/Layback.js',
        'src/treats/system/*.js',
        'src/treats/*.js'
    ];
    
    var packageInfo = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: packageInfo,

        var: {
            packageName: 'layback',
            version: packageInfo.version
        },
        uglify: {
            min: {
                options: {
                    compress: true,
                    mangle: false,
                    beautify: false
                },
                files: {
                    'dist/<%= var.packageName %>.<%= var.version %>.min.js': jsFiles,
                    '<%= var.packageName %>.min.js': jsFiles
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
                    'dist/<%= var.packageName %>.<%= var.version %>.js': jsFiles,
                    '<%= var.packageName %>.js': jsFiles
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
