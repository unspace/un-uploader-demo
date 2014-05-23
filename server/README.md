# un-uploader Demo Server

## Getting set-up

1. Check out Vagrantfile.example and make your own Vagrantfile
2. Create your own `config/database.yml`
3. Create your own `config/secrets.yml`
4. Run the codes:

```sh
$ vagrant up
```

At this point, if you are using VMware and not using NFS you will probably need
to re-install the Guest Additions, use
[this guide](http://kb.vmware.com/kb/1022525).

```sh
$ vagrant ssh
$ bundle
$ rake db:setup
$ bin/rails s
```

Sidekiq is used for background processing, in order to process uploads it must
be running:

```sh
$ bundle exec sidekiq
```
