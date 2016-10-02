module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      files: ['client/scripts/*.js', 'client/styles/*.less'],
      tasks: ['browserify', 'less']
    },
    browserify: {
      dist: {
        files: {
          'client/app.bundle.js': ['client/scripts/*.js'],
        }
      }
    },
    less: {
      development: {
        options: {
          paths: ['client/styles/*.less']
        },
        files: {
          'client/styles.bundle.css': 'client/styles/*.less'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-browserify');
};
