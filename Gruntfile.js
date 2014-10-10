var DEV_FOLDER = 'dev',
	DEPLOY_FOLDER = 'dist',
						   
	DEPLOY_ANALYTICS_ID = 'UA-00000000-1',
	DEV_ANALYTICS_ID = 'UA-00000000-2',

	HTML_MIN_OPTIONS = {
		collapseBooleanAttributes: true,
		collapseWhitespace: true,
		removeAttributeQuotes: true,
		removeCommentsFromCDATA: true,
		removeEmptyAttributes: true,
		removeOptionalTags: true,
		removeRedundantAttributes: true,
		useShortDoctype: true
	};

module.exports = function (grunt) {


	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-text-replace');

	var initialCongif = {

		pkg: grunt.file.readJSON('package.json'),

		browserSync: {
			dev: {
				bsFiles: {
					src: [
                        'dev/**/**'
                    ]
				},
				options: {
					server: {
						baseDir: 'dev'
					},
					watchTask: true
				}
			}
		},

		cacheBust: {
			options: {
				encoding: 'utf8',
				algorithm: 'md5',
				length: 6,
				enableUrlFragmentHint:true
			},
			index: {
				files: [{
					src: [
						'<%= destination %>/index.html',
						'<%= destination %>/scripts/preloader.js'
					]
				}]
			}
		},

		watch:{
			spritesheet:{
				files: ['src/styles/spritesheet/**'],
				tasks: ['copy:spritesheet']
			},
			preloader:{
				files: ['src/scripts/preloader.js'],
				tasks: ['copy:preloader']
			},
			browserify:{
				files: ['src/scripts/**', '!src/scripts/preloader.js'],
				tasks: ['browserify']
			},
			styles:{
				files: ['src/styles/**/**.scss'],
				tasks: ['compass']
			},
			partials:{
				files: ['src/partials/*.html'],
				tasks: ['copy:html', 'htmlmin:partials', 'browserify']
			},
			index:{
				files: ['src/index.html'],
				tasks: ['copy:html','replace']
			},
			assets:{
				files: ['src/assets/**'],
				tasks: ['copy:assets']
			},
            json:{
                files: ['data/**/*.json'],
                tasks: ['copy:json']
            }
		},

		clean:{
			all:[DEV_FOLDER+'/**', DEPLOY_FOLDER+'/**'],
			data:['<%= destination %>/data/**'],
			assets:['<%= destination %>/assets/**'],
			styles:['<%= destination %>/styles/**'],
			scripts:['<%= destination %>/scripts/**'],
			obsoleteFiles:[
				'<%= destination %>/partials/main.html',
				'<%= destination %>/scripts/main.js',
				'<%= destination %>/scripts/preloader.js',
				'<%= destination %>/scripts/partials/**/*',
				'<%= destination %>/styles/main.css'
			],
			partials:['<%= destination %>/partials/**'],
			index:['<%= destination %>/index.html']
		},

		browserify:{
			options: {
				transform: ['brfs'],
				bundleOptions: {
					debug:'<%= !grunt.config.get("isDeploy") %>'
				}
			},
			main: {
				files: {
					'<%= destination %>/scripts/main.js':'src/scripts/main.js'
				}
			}
		},


		compass: {
			options: {
				sassDir: 'src/styles',
				imagesDir: 'src/styles',
				cssDir: '<%= destination %>/styles'
			},

			main: {
				options: {
					outputStyle:'<%= isDeploy ? "compressed" : "expanded" %>'
				}
			}
		},

		copy:{
            json:{
                expand: true,
                dot: true,
                cwd: 'src',
                dest: '<%= destination %>',
                src: [
                    'data/**/*.json'
                ]
            },
			assets: {
				expand: true,
				dot: true,
				cwd: 'src',
				dest: '<%= destination %>',
				src: [
					'assets/fonts/**','assets/images/**','assets/cursors/**'
				]
			},
			html: {
				expand: true,
				dot: true,
				cwd: 'src',
				dest: '<%= destination %>',
				src: [
					'**/*.html'
				]
			},
			preloader: {
				expand: true,
				dot: true,
				cwd: 'src',
				dest: '<%= destination %>',
				src: [
					'scripts/preloader.js'
				]
			},
			spritesheet:{
				expand: true,
				dot: true,
				cwd:'src',
				dest: '<%= destination %>',
				src: [
					'styles/spritesheet/*.*'
				]
			},
			root: {
				expand: true,
				dot: true,
				cwd: '',
				dest: '<%= destination %>',
				src: [
					'favicon.ico'
				]
			},
			data: {
				expand: true,
				dot: true,
				cwd: '',
				dest: '<%= destination %>',
				src: [
					'data/**', '!data/**/*.WAV','!data/**/*.bat'
				]
			}
		},

		uglify: {
			options: {
				banner: '/*!\n'+
				' * SOUND_CITY_PROJECT - <%= grunt.template.today("yyyy-mm-dd") %>\n'+
				' * https://github.com/rvmook/sound-city-project/\n'+
				' * Author: Rick van Mook\n'+
				' */\n\n',
				preserveComments:'some',
				report:'gzip'
			},
			dist: {

				files: [
					{
						expand: true,
						cwd: '<%= destination %>/scripts',
						src: '**/*.js',
						dest: '<%= destination %>/scripts'
					}
				]
			}
		},

		cssmin: {
			dist: {
				options: {
					report:'gzip'
				},
				files: {
					'<%= destination %>/styles/main.css': ['<%= destination %>/styles/main.css']
				}
			}
		},

		replace: {
			analyticsId: {
				src: ['<%= destination %>/index.html'],
				overwrite: true,
				replacements: [
					{
						from: 'GRUNT_REPLACE_ANALYTICS_ID',
						to:'<%= analyticsId %>'
					},
					{
						from:'#grunt-cache-bust',
						to:''
					}
				]
			}
		},

		htmlmin: {

			dist: {
				options:HTML_MIN_OPTIONS,
				files: [{
					expand: true,
					cwd: '<%= destination %>',
					src: '{,*/}*.html',
					dest: '<%= destination %>'
				}]
			},
			partials:{
				options:HTML_MIN_OPTIONS,
				files:{
					'src/scripts/partials/about.html':'src/partials/about.html',
					'src/scripts/partials/sound.html':'src/partials/sound.html'
				}
			}
		},

		analyticsId:DEV_ANALYTICS_ID,
		destination:DEV_FOLDER,
		isDeploy:false
	};

	grunt.initConfig(initialCongif);

	grunt.registerTask('default', 'dev');

	grunt.registerTask('dev', function(){
		build(false);
	});

	grunt.registerTask('deploy', function(){
		build(true);
	});


	function build(isDeploy) {


		var config = initialCongif;

		var taskSequence = [
			'clean:all',
			'htmlmin:partials',
			'browserify',
			'compass',
			'copy'
		];

		if(isDeploy !== config.isDeploy) {
			config.isDeploy = isDeploy;
		}

		config.compass.options.debugInfo = !config.isDeploy;

		if(config.isDeploy) {

			config.destination = DEPLOY_FOLDER;
			config.analyticsId = DEPLOY_ANALYTICS_ID;
			grunt.loadNpmTasks('grunt-contrib-cssmin');
			grunt.loadNpmTasks('grunt-contrib-uglify');
			grunt.loadNpmTasks('grunt-cache-bust');

			taskSequence = taskSequence.concat(
				[
					'htmlmin:dist',
					'cssmin',
					'cacheBust',
					'clean:obsoleteFiles',
					'replace',
					'uglify'
				]);

		} else {
			taskSequence.push('replace','browserSync', 'watch');
		}



		grunt.initConfig(config);


		grunt.task.run.apply(grunt.task, taskSequence);
	}
};