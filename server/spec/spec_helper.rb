# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rspec/rails'
require 'rspec/autorun'
require 'sidekiq/testing'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

# Checks for pending migrations before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.maintain_test_schema!

RSpec.configure do |config|
  config.include SpecHelpers::Requests, type: :request
  config.use_transactional_fixtures = true
  config.order = 'random'

  config.before :suite do
    $pusher.test!
  end

  config.before :each do
    Sidekiq::Worker.clear_all
    $pusher.clear!
  end
end

RSpec::Matchers.define :have_queued_job_at do |at,*expected|
  match do |actual|
    actual.jobs.any? { |job| job["args"] == Array(expected) && job["at"].to_i == at.to_i }
  end

  failure_message_for_should do |actual|
    "expected that #{actual} would have a job queued with #{expected} at time #{at}"
  end

  failure_message_for_should_not do |actual|
    "expected that #{actual} would not a have a job queued with #{expected} at time #{at}"
  end

  description do
    "have a job queued with #{expected} at time #{at}"
  end
end
