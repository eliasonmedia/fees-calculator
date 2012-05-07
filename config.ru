use Rack::Static, 
  :urls => ["/css", "/js", "/images"],
  :root => "public",
  :cache_control => 'no-cache'

run lambda { |env|
  [
    200, 
    {
      'Content-Type'  => 'text/html', 
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open('public/index.html', File::RDONLY)
  ]
}
