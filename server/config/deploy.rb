# config valid only for Capistrano 3.1
lock '3.2.1'

set :application, 'un-uploader-demo'
set :repo_url, 'git@github.com:unspace/un-uploader-demo.git'

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
      sudo "service puma restart app=#{current_path}"
      sudo "service sidekiq restart app=#{current_path} index=0"
    end
  end

  desc 'Stop application'
  task :stop do
    on roles(:app), in: :sequence, wait: 1 do
      sudo "service puma stop app=#{current_path}"
      sudo "service sidekiq stop app=#{current_path} index=0"
    end
  end

  desc 'Start application'
  task :start do
    on roles(:app), in: :sequence, wait: 1 do
      sudo "service puma start app=#{current_path}"
      sudo "service sidekiq start app=#{current_path} index=0"
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

desc "build and copy ember-cli app"
task :build_ember_cli do
  run_locally do
    within '../client' do
      execute 'node_modules/ember-cli/bin/ember', 'build', "--environment #{fetch(:rails_env)}"
      execute 'cp', '-rv', 'dist/*', '../server/public/'
    end
  end
end
