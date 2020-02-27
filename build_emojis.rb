require 'net/http'
require 'open-uri'
require 'json'

url = 'https://raw.githubusercontent.com/iamcal/emoji-data/master/emoji.json'
uri = URI(url)
response = Net::HTTP.get(uri)

data_hash = JSON.parse(response)
new_hash = []

data_hash.each do |emoji|
  emoji_category = if ['People & Body', 'Smileys & Emotion'].include?(emoji['category'])
    'Smileys & People'
  else
    emoji['category']
  end

  new_hash << {
    category: emoji_category,
    short_name: emoji['short_name'],
    short_names: emoji['short_names'],
    x: emoji['sheet_x'],
    y: emoji['sheet_y'],
    order: emoji['sort_order'],
  } if emoji['has_img_twitter']
end

File.open('src/emojis.json', 'w') { |file| file.puts JSON.generate(new_hash) }

url =
uri = URI(url)
response = Net::HTTP.get(uri)

open('https://github.com/iamcal/emoji-data/blob/master/sheet_twitter_32.png?raw=true') {|f|
  File.open('src/assets/emojis.png',"wb") do |file|
    file.puts f.read
  end
}
