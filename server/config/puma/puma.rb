env = :production

conf = {
  production: {
    domain: 'uploader.unspace.ca',
    workers: 3,
    threads: [4, 16]
  },
}[env]

environment env.to_s
bind        "unix:///sites/#{conf[:domain]}/shared/sockets/puma.sock"
threads     *conf[:threads]
workers     conf[:workers]

preload_app!

on_worker_boot do
  ActiveRecord::Base.establish_connection
  $redis.client.reconnect
end
