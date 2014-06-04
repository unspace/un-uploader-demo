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
$ cd server
$ bundle
$ rake db:setup
$ bin/rails s
```

Sidekiq is used for background processing, in order to process uploads it must
be running:

```sh
$ bundle exec sidekiq
```

## Amazon S3

In our example we upload directly to S3 from the client. We strongly recommend
this approach because it ensures that the original file is backed-up in
redundant storage and frees you from needing to implement this functionality in
your own infrastructure.

Since we upload directly to S3, it is important to set a CORS configuration on
the bucket that you will upload to:

```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <ExposeHeader>ETag</ExposeHeader>
    <ExposeHeader>x-amz-id-2</ExposeHeader>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

The above configuration is a bit loose as it allows file uploads from any
source. In production you will likey want to change `<AllowedOrigin>` from `*`
to `https://mysite.com`, if you want to allow HTTPS and HTTP uploading you can
simply add another `<AllowedOrigin>` rule with the `http` scheme.

## Pusher

In our example we use Pusher as a way to send events to the client, as you can
see this doesn't occupy a lot of code and could be substituted for another
solution such as [Faye](http://faye.jcoglan.com), [Socket.IO](http://socket.io),
or a multitude of other pub/sub solutions.
