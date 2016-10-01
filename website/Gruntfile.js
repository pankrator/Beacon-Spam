module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      files: ['client/scripts/*.js'],
      tasks: ['browserify']
    },
    browserify: {
      dist: {
        files: {
          'client/app.bundle.js': ['client/scripts/*.js'],
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
};
