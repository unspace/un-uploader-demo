# Un-Uploader

An example full-stack file upload workflow for Ember applications.

## Why?

First, lets talk about the elephant in the room, why even manage all of this
yourself? If your use-case falls into one of an existing service and that makes
sense to you, then just do that. Here are some of those services:

* [Ink](https://www.inkfilepicker.com)
* [Transloadit](https://transloadit.com)
* [Camera Tag](http://cameratag.com)

But sometimes you can't get away with a prepackaged solution, maybe you need to
process GPS data in a specific way, or maybe you can interface with something
like AWS Elastic Transcoder but still need to manage the workflow surrounding
the upload process yourself.

## [Client](client/)

When it comes to file uploads, Ember is only a portion of the solution, we
thought it was a good idea to provide an end-to-end implementation that
demonstrates a real-world upload and processing workflow, not just Base64
encoding form data and sending it along as a string in a JSON object &mdash;
don't do that.

## [Server](server/)

Since we're experienced Ruby developers we've implemented the server portion
with Ruby. Consider it a reference implementation, we'd love to see PRs for
different server implementations. If you are curious, here are the different
tools we use on the server and what they do:

* [Rails](http://rubyonrails.org) - Used for serving REST API that the Ember app consumes
* [Sidekiq](http://sidekiq.org) - Multi-threaded worker queue, used for upload processing

## Integrations

### S3

S3 is used for storing the original file upload, it offloads the work from our
servers and best of all by using this approach we get a redundant back-up of
the original file. It's very cheap, and it supports resumable multi-part file
uploads with CORS &mdash; exactly what we need.

Alternatives: We've had success using
[nginx-upload-module](https://github.com/vkholodkov/nginx-upload-module) with
1.2.x branch of Nginx in the past. There are also Lua-based options for newer
versions of Nginx like
[nginx-big-upload](https://github.com/pgaertig/nginx-big-upload) and
[lua-resty-upload](https://github.com/openresty/lua-resty-upload) that look
promising. We really shy away from having file uploads go directly through the
application stack, if you can use S3 or an alternative
that promises the same functionality we think that is the best approach.

### Pusher

Pusher provides a robust publish / subscribe messaging platform that we use to
stream events to the client when uploads are processed. You could host
your own pub/sub implementation using something like the iconic
[Socket.io](http://socket.io) (Node), [Faye](http://faye.jcoglan.com/)
(Node/Ruby), or a long-polling solution like Sam Saffron's
[message_bus](https://github.com/SamSaffron/message_bus). You have many options
and you aren't locked into Pusher, but Pusher is really great.

## Future

* We'd love to turn the Ember part of this example into a library.
* We'd love to turn the Ruby part of this example into a library.
* But first we want to see what happens and get some feedback :heart:
