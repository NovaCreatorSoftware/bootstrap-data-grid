/*jshint node:true*/
module.exports = function (grunt) {
    "use strict";

    /* Hint: Using grunt-strip-code to remove comments from the release file */

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        fontawesome: 'fa',
        banner: '/*! <%= "\\r\\n * " + pkg.title %> v<%= pkg.version %> - <%= grunt.template.today("mm/dd/yyyy") + "\\r\\n" %>' +
            ' * Copyright (c) 2015-<%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <%= (pkg.homepage ? "(" + pkg.homepage + ")" : "") + "\\r\\n" %>' +
            ' * Licensed under <%= pkg.licenses[0].type + " " + pkg.licenses[0].url + "\\r\\n */\\r\\n" %>',
        folders: {
            dist: "dist",
            docs: "docs",
            src: "src"
        },

        clean: {
            api: [ "<%= folders.docs %>" ],
            build: [ "<%= folders.dist %>" ]
        },

        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: '<%= folders.dist %>',
                    outdir: '<%= folders.docs %>/'
                }
            }
        },

        version: {
            default: {
                src: 'bower.json',
                options: {
                    version: '<%= pkg.version %>'
                }
            }
        },

        less: {
            default: {
                files: {
                    "<%= folders.dist %>/css/<%= pkg.namespace %>.css": "<%= folders.src %>/<%= pkg.namespace %>.less"
                }
            }
        },

        bower_concat: {
            all: {
                dest: {
                    js: '<%= folders.dist %>/js/dependencies.js',
                    css: '<%= folders.dist %>/css/dependencies.css'
                },

                dependencies: {
                    'dragtable': [ 'jquery', 'jquery-ui' ]
                },

                mainFiles: {
                    'x-editable': [
                        'dist/bootstrap3-editable/js/bootstrap-editable.js',
                        'dist/bootstrap3-editable/css/bootstrap-editable.css'
                    ],
                    'polymer': [''], //ignore
                    'moment-js': [
                        '../moment/min/moment.min.js'
                    ]
                }
            }
        },

        copy: {
            main: {
                files: [{ 
                    expand: true, 
                    src: ['bower_components/x-editable/dist/bootstrap3-editable/img/*'],
                    dest: '<%= folders.dist %>/img/',
                    flatten: true,
                    filter: 'isFile'
                }]
            }
        },

        concat: {
            scripts: {
                options: {
                    separator: '\r\n\r\n',
                    banner: '<%= banner %>;(function ($, window, undefined)\r\n{\r\n    /*jshint validthis: true */\r\n    "use strict";\r\n\r\n',
                    footer: '\r\n})(jQuery, window);',
                    process: function(src, filepath) {
                        var result = src.trim().replace(/(.+?\r\n)/gm, '    $1');
                        var end = [0, ""];
                        var lastChar = result[result.length - 1];

                        if(lastChar === ";") {
                            end = (result[result.length - 2] === ")") ? 
                                (result[result.length - 2] === "}") ? [3, "    });"] : [2, ");"] : [2, "    };"];
                        } else if(lastChar === "}") {
                            end = [1, "    }"];
                        }

                        return result.substr(0, result.length - end[0]) + end[1];
                    }
                },
                files: {
                    '<%= folders.dist %>/js/<%= pkg.namespace %>.js': [
                        '<%= folders.src %>/internal.js',
                        '<%= folders.src %>/public.js',
                        '<%= folders.src %>/plugin.js',
                        '<%= folders.src %>/extensions/**/*.js'
                    ],
                    '<%= folders.dist %>/js/<%= pkg.namespace %>.<%= fontawesome %>.js': 
                        [ '<%= folders.src %>/fontawesome.js' ]
                }
            },
            styles: {
                options: {
                    separator: '\r\n\r\n',
                    banner: '<%= banner %>'
                },
                files: { 
                    '<%= folders.dist %>/css/<%= pkg.namespace %>.css': [ '<%= folders.dist %>/css/<%= pkg.namespace %>.css' ]
                }
            }
        },

        csslint: {
            default: {
                options: {
                    'adjoining-classes': false,
                    'important': false,
                    'outline-none': false,
                    'overqualified-elements': false
                },
                src: '<%= folders.dist %>/<%= pkg.namespace %>.css'
            }
        },
        
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true,
                    $: true,
                    console: true
                }
            },
            //files: [ '<%= folders.dist %>/js/<%= pkg.namespace %>.js' ], //use when deploy, to test directly on the produced file
            files: [ '<%= folders.src %>/**.js' ], //use in dev, when it's needed to know exactly when the error is
            test: {
                options: {
                    globals: {
                        jQuery: true,
                        $: true,
                        QUnit: true,
                        module: true,
                        test: true,
                        start: true,
                        stop: true,
                        expect: true,
                        ok: true,
                        equal: true,
                        deepEqual: true,
                        strictEqual: true
                    }
                },
                files: {
                    src: [ 'test/tests-internal.js', 'test/tests-rendering.js' ]
                }
            },
            grunt: {
                files: {
                    src: [
                        'Gruntfile.js'
                    ]
                }
            }
        },

        cssmin: {
            default: {
                options: {
                    report: 'gzip'
                },
                files: {
                    '<%= folders.dist %>/css/<%= pkg.namespace %>.min.css': 
                        [ '<%= folders.dist %>/css/<%= pkg.namespace %>.css' ],
                    '<%= folders.dist %>/css/dependencies.min.css': 
                        [ '<%= folders.dist %>/css/dependencies.css' ]                        
                }
            }
        },

        uglify: {
            default: {
                options: {
                    preserveComments: 'some',
                    report: 'gzip'
                },
                files: {
                	'<%= folders.dist %>/js/<%= pkg.namespace %>.min.js': 
                        [ '<%= folders.dist %>/js/<%= pkg.namespace %>.js' ],
                    '<%= folders.dist %>/js/dependencies.min.js': 
                        [ '<%= folders.dist %>/js/dependencies.js' ],
                    '<%= folders.dist %>/js/<%= pkg.namespace %>.<%= fontawesome %>.min.js': 
                        [ '<%= folders.dist %>/js/<%= pkg.namespace %>.<%= fontawesome %>.js' ]
                }
            }
        },

        nugetpack: {
            default: {
                src: '<%= pkg.namespace %>.nuspec',
                dest: '<%= folders.dist %>',
                options: {
                    version: '<%= pkg.version %>'
                }
            }
        },
        compress: {
            default: {
                options: {
                    archive: '<%= folders.dist %>/<%= pkg.namespace %>-<%= pkg.version %>.zip'
                },
                files: [{
                    flatten: true,
                    expand: true, 
                    src: ['<%= folders.dist %>/js/*.js', '<%= folders.dist %>/css/*.css', '<%= folders.dist %>/img/*.*'], dest: '/'
                }]
            }
        },

        qunit: {
            files: [ 'test/index.html' ]
        },

        exec: {
            publish: {
                cmd: 'npm publish .'
            }
        },
        
        nugetpush: {
            default: {
                src: '<%= folders.dist %>/*.nupkg'
            }
        },

        watch: {
            all: {
                files: [ '<%= folders.src %>/*.*', 'demo/**.*' ],
                tasks: [ 'build' ],
                livereload: true
            }
        },
        
        buildcontrol: {
        	options: {
        		dir: 'dist',
        		commit: true,
        		push: true,
        		message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
        	},
        	pages: {
        		options: {
        			remote: 'git@github.com:cristimanole/bootstrap-data-grid.git',
        			branch: 'gh-pages'
        		}
        	},
        	/*heroku: {
        		options: {
        			remote: 'git@heroku.com:example-heroku-webapp-666.git',
        			branch: 'master',
        			tag: pkg.version
        		}
        	},*/
        	local: {
        		options: {
        			remote: '../',
        			branch: 'build'
        		}
        	}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-nuget');
    grunt.loadNpmTasks('grunt-regex-replace');
    grunt.loadNpmTasks('grunt-build-control');

    grunt.registerMultiTask('version', 'sets version tag', function () {
        var pkg = grunt.file.readJSON(this.data.src);
        pkg["version"] = this.data.options.version;
        grunt.file.write(this.data.src, JSON.stringify(pkg, null, 4));
    });
    grunt.registerTask('default', ['build']);
    grunt.registerTask('api', ['clean:api', 'yuidoc']);
    grunt.registerTask('test', ['qunit']);
    grunt.registerTask('build', ['clean:build', 'version', 'less', 'copy', 'bower_concat', 'concat', 'csslint', 'jshint', 'test']); 
    grunt.registerTask('release', ['build', 'api', 'cssmin', 'uglify', 'compress', 'nugetpack']);
    grunt.registerTask('publish', ['nugetpush', 'exec:publish']);
};