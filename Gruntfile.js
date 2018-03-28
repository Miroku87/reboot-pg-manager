// Generated on 2017-09-11 using
// generator-bootstrap4 0.0.2
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt)
{

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required grunt tasks
    require('jit-grunt')(grunt, {
        useminPrepare : 'grunt-usemin',
        nunjucks : 'grunt-nunjucks-2-html'
    });
    grunt.loadNpmTasks('grunt-nunjucks-2-html');

    // Configurable paths
    var config = {
        app : 'app',
        dist : 'dist',
        tmp : '.tmp',
        version: '0.6.0',
        staging_api_url : "http://api-beta.rebootgrv.com/api.php",
        staging_site_url : "http://db-beta.rebootgrv.com",
        prod_api_url : "http://api.rebootgrv.com/api.php",
        prod_site_url : "http://database.rebootgrv.com"
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config : config,

        // Watches files for changes and runs tasks based on the changed files
        watch : {
            /*bower : {
                files : ['bower.json'],
                tasks : ['wiredep']
            },*/
            babel : {
                files : ['<%= config.app %>/scripts/{,*/}*.js'],
                tasks : ['babel:dev']
            },
            babelTest : {
                files : ['test/spec/{,*/}*.js'],
                tasks : ['babel:test', 'test:watch']
            },
            gruntfile : {
                files : ['Gruntfile.js']
            },
            sass : {
                files : ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
                tasks : ['sass:dev', 'postcss']
            },
            styles : {
                files : ['<%= config.app %>/styles/{,*/}*.css'],
                tasks : ['newer:copy:styles', 'postcss']
            },
            nunjucks : {
                files : ['<%= config.app %>/*.html', '<%= config.app %>/templates/*.html'],
                tasks : ['nunjucks']
            }
        },

        browserSync : {
            options : {
                notify : false,
                background : true,
                watchOptions : {
                    ignored : ''
                }
            },
            livereload : {
                options : {
                    files : [
                        //'<%= config.app %>/{,*/}*.html',
                        '.tmp/*.html',
                        '.tmp/styles/{,*/}*.css',
                        '<%= config.app %>/images/{,*/}*',
                        '.tmp/scripts/{,*/}*.js'
                    ],
                    port : 9000,
                    server : {
                        baseDir : ['.tmp', config.app],
                        routes : {
                            '/bower_components' : './bower_components'
                        }
                    }
                }
            },
            test : {
                options : {
                    port : 9001,
                    open : false,
                    logLevel : 'silent',
                    host : '0.0.0.0',
                    server : {
                        baseDir : ['.tmp', './test', config.app],
                        routes : {
                            '/bower_components' : './bower_components'
                        }
                    }
                }
            },
            dist : {
                options : {
                    background : false,
                    server : '<%= config.dist %>'
                }
            }
        },

        //renders the html templates
        nunjucks : {
            options : {
                data : {
                    body_classes : "",
                    version : "<%= config.version %>"
                }
            },
            dev : {
                files : [
                    {
                        expand : true,
                        cwd : "./app/",
                        src : "*.html",
                        dest : ".tmp/",
                        ext : ".html"
                    }
                ]
            }
        },

        // Empties folders to start fresh
        clean : {
            dist : {
                files : [{
                    dot : true,
                    src : [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            server : '.tmp'
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        eslint : {
            target : [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                '!<%= config.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // Mocha testing framework configuration options
        mocha : {
            all : {
                options : {
                    run : true,
                    urls : ['http://<%= browserSync.test.options.host %>:<%= browserSync.test.options.port %>/index.html']
                }
            }
        },

        // Compiles ES6 with Babel
        babel : {
            options : {
                sourceMap : true
            },
            dev : {
                files : [{
                    expand : true,
                    cwd : '<%= config.app %>/scripts',
                    src : '{,*/}*.js',
                    dest : '.tmp/scripts',
                    ext : '.js'
                }]
            },
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= config.app %>/scripts',
                    src : '{,*/}*.js',
                    dest : 'dist/scripts',
                    ext : '.js'
                }]
            },
            test : {
                files : [{
                    expand : true,
                    cwd : 'test/spec',
                    src : '{,*/}*.js',
                    dest : '.tmp/spec',
                    ext : '.js'
                }]
            }
        },

        // Compiles Sass to CSS and generates necessary files if requested
        sass : {
            options : {
                sourceMap : true,
                sourceMapEmbed : true,
                sourceMapContents : true,
                includePaths : ['.']
            },
            dev : {
                files : [{
                    expand : true,
                    cwd : '<%= config.app %>/styles',
                    src : ['*.{scss,sass}'],
                    dest : '.tmp/styles',
                    ext : '.css'
                }]
            },
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= config.app %>/styles',
                    src : ['*.{scss,sass}'],
                    dest : 'dist/styles',
                    ext : '.css'
                }]
            }
        },

        postcss : {
            options : {
                map : true,
                processors : [
                    // Add vendor prefixed styles
                    require('autoprefixer')({
                        browsers : [
                            'Android 2.3',
                            'Android >= 4',
                            'Chrome >= 35',
                            'Firefox >= 31',
                            // Note: Edge versions in Autoprefixer & Can I Use refer to the EdgeHTML rendering engine
                            // version, NOT the Edge app version shown in Edge's "About" screen. For example, at the
                            // time of writing, Edge 20 on an up-to-date system uses EdgeHTML 12. See also
                            // https://github.com/Fyrd/caniuse/issues/1928
                            'Edge >= 12',
                            'Explorer >= 9',
                            'iOS >= 7',
                            'Opera >= 12',
                            'Safari >= 7.1'
                        ]
                    })
                ]
            },
            dist : {
                files : [{
                    expand : true,
                    cwd : '.tmp/styles/',
                    src : '{,*/}*.css',
                    dest : '.tmp/styles/'
                }]
            }
        },

        // Automatically inject Bower components into the HTML file
        wiredep : {
            app : {
                //src: ['<%= config.app %>/*.html'],
                src : ['.temp/*.html'],
                exclude : ['bootstrap.js'],
                ignorePath : /^(\.\.\/)*\.\./
            },
            sass : {
                src : ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
                ignorePath : /^(\.\.\/)+/
            }
        },

        // Renames files for browser caching purposes
        filerev : {
            dist : {
                src : [
                    '<%= config.dist %>/scripts/*.js',
                    '<%= config.dist %>/styles/{,*/}*.css',
                    '<%= config.dist %>/images/{,*/}*.*',
                    '<%= config.dist %>/*.{ico,png}'
                ]
            }
        },

        // Replacing dev vars with prod ones
        replace : {
            staging_urls: {
                options: {
                    patterns: [
                        {
                            match: /(Constants\.API_URL\s*?=\s*?)"[\S\s]*?";/,
                            replacement: '$1"<%= config.staging_api_url %>";'
                        },
                        {
                            match: /(Constants\.SITE_URL\s*?=\s*?)"[\S\s]*?";/,
                            replacement: '$1"<%= config.staging_site_url %>";'
                        }
                    ]
                },
                files: [
                    {src: ['.tmp/scripts/utils/Constants.js'], dest: './'}
                ]
            },
            prod_urls: {
                options: {
                    patterns: [
                        {
                            match: /(Constants\.API_URL\s*?=\s*?)"[\S\s]*?";/,
                            replacement: '$1"<%= config.prod_api_url %>";'
                        },
                        {
                            match: /(Constants\.SITE_URL\s*?=\s*?)"[\S\s]*?";/,
                            replacement: '$1"<%= config.prod_site_url %>";'
                        }
                    ]
                },
                files: [
                    {src: ['.tmp/scripts/utils/Constants.js'], dest: './'}
                ]
            },
            icheck_images: {
                options: {
                    patterns: [
                        {
                            match: /url\((blue\S*?)\)/g,
                            replacement: 'url(../images/$1)'
                        }
                    ]
                },
                files: [
                    {src: ['<%= config.dist %>/styles/vendor.*.css'], dest: './'}
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare : {
            options : {
                root : './',
                staging : '.usemin',
                dest : '<%= config.dist %>',
                flow: {
                    steps: { js: ['concat', 'uglify'], css: ['concat', 'cssmin'] },
                    post: {
                        js: [{
                            name: 'uglify',
                            createConfig: function (context, block) {
                                var generated = context.options.generated;
                                generated.options = {
                                    sourceMap: true
                                };
                            }
                        }]
                    }
                }
            },
            html : '<%= config.tmp %>/*.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin : {
            options : {
                assetsDirs : [
                    '<%= config.dist %>',
                    '<%= config.dist %>/images',
                    '<%= config.dist %>/styles',
                    '<%= config.dist %>/scripts'
                ]
            },

            html : ['<%= config.dist %>/{,*/}*.html'],
            css : ['<%= config.dist %>/styles/{,*/}*.css']
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin : {
            dist : {
                files : [
                    {
                        expand : true,
                        cwd : '<%= config.app %>/images',
                        src : '*.{gif,jpeg,jpg,png}',
                        dest : '<%= config.dist %>/images'
                    },
                    {
                        expand : true,
                        cwd: './bower_components/iCheck/skins/square/',
                        src : ['blue.png','blue@2x.png'],
                        dest : '<%= config.dist %>/images'
                    }
                ]
            }
        },

        svgmin : {
            dist : {
                files : [{
                    expand : true,
                    cwd : '<%= config.app %>/images',
                    src : '{,*/}*.svg',
                    dest : '<%= config.dist %>/images'
                }]
            }
        },

        htmlmin : {
            dist : {
                options : {
                    collapseBooleanAttributes : true,
                    collapseWhitespace : true,
                    conservativeCollapse : true,
                    removeAttributeQuotes : true,
                    removeCommentsFromCDATA : true,
                    removeComments : true,
                    removeEmptyAttributes : true,
                    removeOptionalTags : true,
                    // true would impact styles with attribute selectors
                    removeRedundantAttributes : false,
                    useShortDoctype : true
                },
                files : [{
                    expand : true,
                    cwd : '<%= config.dist %>',
                    src : '{,*/}*.html',
                    dest : '<%= config.dist %>'
                }]
            }
        },

        // By default, your `index.html`'s <!-- Usemin block --> will take care
        // of minification. These next options are pre-configured if you do not
        // wish to use the Usemin blocks.
        // cssmin: {
        //   dist: {
        //     files: {
        //       '<%= config.dist %>/styles/main.css': [
        //         '.tmp/styles/{,*/}*.css',
        //         '<%= config.app %>/styles/{,*/}*.css'
        //       ]
        //     }
        //   }
        // },
        // uglify: {
        //   dist: {
        //     files: {
        //       '<%= config.dist %>/scripts/scripts.js': [
        //         '<%= config.dist %>/scripts/scripts.js'
        //       ]
        //     }
        //   }
        // },
        // concat: {
        //   dist: {}
        // },

        // Copies remaining files to places other tasks can use
        copy : {
            dist : {
                files : [
                    {
                        expand : true,
                        dot : true,
                        cwd : '<%= config.app %>',
                        dest : '<%= config.dist %>',
                        src : [
                            '*.{ico,png,txt}',
                            'images/{,*/}*.{webp,jpg,jpeg,png,gif}',
                            'fonts/{,*/}*.*'
                        ]
                    },
                    {
                        expand : true,
                        dot : true,
                        cwd : '.tmp',
                        src : '{,*/}*.html',
                        dest : '<%= config.dist %>'
                    },
                    {
                        expand : true,
                        flatten: true,
                        dot : true,
                        cwd : '.',
                        src : ['bower_components/font-awesome/fonts/*','bower_components/bootstrap/fonts/*','bower_components/Ionicons/fonts/*'],
                        dest : '<%= config.dist %>/fonts'
                    }]
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent : {
            server : [
                'babel:dev',
                'sass:dev'
            ],
            test : [
                'babel:test'
            ],
            dist : [
                'babel:dev',
                'sass:dist',
                'imagemin',
                'svgmin'
            ]
        }
    });


    grunt.registerTask('serve', 'start the server and preview your app', function (target)
    {

        if (target === 'dist')
        {
            return grunt.task.run(['build', 'browserSync:dist']);
        }

        grunt.task.run([
            'clean:server',
            'nunjucks',
            //'wiredep',
            'concurrent:server',
            'postcss',
            'browserSync:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', function (target)
    {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run([target ? ('serve:' + target) : 'serve']);
    });

    grunt.registerTask('test', function (target)
    {
        if (target !== 'watch')
        {
            grunt.task.run([
                'clean:server',
                'concurrent:test',
                'postcss'
            ]);
        }

        grunt.task.run([
            'browserSync:test',
            'mocha'
        ]);
    });

    //TODO: sistemare l'url dell'immagine di icheck
    grunt.registerTask('preprod', [
        'clean:dist',
        'nunjucks',
        //'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'postcss',
        'replace:staging_urls',
        'concat',
        'cssmin',
        'uglify',
        'copy:dist',
        'filerev',
        'usemin',
        'htmlmin',
        'replace:icheck_images'
    ]);

    grunt.registerTask('prod', [
        'clean:dist',
        'nunjucks',
        //'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'postcss',
        'replace:prod_urls',
        'concat',
        'cssmin',
        'uglify',
        'copy:dist',
        'filerev',
        'usemin',
        'htmlmin',
        'replace:icheck_images'
    ]);

    grunt.registerTask('default', [
        'serve'
    ]);
};
