# config valid only for Capistrano 3.1
lock '3.2.1'

set :application, 'un-uploader-demo'
set :repo_url, 'git@github.com:unspace/un-uploader-demo.git'

# Set up a strategy to deploy only a project directory (not the whole repo)
set :git_strategy, RemoteCacheWithProjectRootStrategy
set :project_root, 'server'

# Default value for :linked_files is []
set :linked_files, %w[
  config/database.yml
  config/secrets.yml
]

# Default value for linked_dirs is []
set :linked_dirs, %w[
  log
  tmp/cache
  tmp/sockets
  tmp/puma
  tmp/sidekiq
  tmp/pids
]

namespace :deploy do
  desc 'Restart application'
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      sudo "/sbin/restart puma app=#{current_path}"
      sudo "/sbin/restart sidekiq app=#{current_path} index=0"
    end
  end

  desc 'Stop application'
  task :stop do
    on roles(:app), in: :sequence, wait: 1 do
      sudo "/sbin/stop puma app=#{current_path}"
      sudo "/sbin/stop sidekiq app=#{current_path} index=0"
    end
  end

  desc 'Start application'
  task :start do
    on roles(:app), in: :sequence, wait: 1 do
      sudo "/sbin/start puma app=#{current_path}"
      sudo "/sbin/start sidekiq app=#{current_path} index=0"
    end
  end

  after :publishing, :restart
end

desc "Check that we can access everything"
task :check_write_permissions do
  on roles(:all) do |host|
    if test("[ -w #{fetch :deploy_to} ]")
      info "#{fetch :deploy_to} is writable on #{host}"
    else
      error "#{fetch :deploy_to} is not writable on #{host}"
    end
  end
end

desc "build, copy  and commit ember-cli app"
task :build_ember_cli do
  run_locally do
    execute "git rm --ignore-unmatch public/index.html"
    execute "git rm --ignore-unmatch public/assets/*.js"
    execute "git rm --ignore-unmatch public/assets/*.css"
    within '../client' do
      execute 'node_modules/ember-cli/bin/ember', 'build', "--environment #{fetch(:rails_env)}"
      execute 'cp', '-rv', 'dist/*', '../server/public/'
      execute "git add ../server/public"
      execute "git commit -m 'updated ember app'", raise_on_non_zero_exit: false
    end
  end
end
