on escape_quotes(string_to_escape)
  set AppleScript's text item delimiters to the "\""
  set the item_list to every text item of string_to_escape
  set AppleScript's text item delimiters to the "\\\""
  set string_to_escape to the item_list as string
  set AppleScript's text item delimiters to ""
  return string_to_escape
end escape_quotes

set target_app to null
if application "iTunes" is running then
  set target_app to "iTunes"
else
  if application "Spotify" is running then
    set target_app to "Spotify"
  end if
end if

if target_app is not null
  using terms from application "iTunes"
    tell application target_app
      set out to "{"
      set out to out & "\"source\": \"" & target_app & "\""
      set out to out & ", \"state\": \"" & player state & "\""
      if player state is playing then
        set out to out & ", \"track\": {"
        set out to out & "\"artist\": \"" & my escape_quotes(current track's artist) & "\""
        set out to out & ", \"album\": \"" & my escape_quotes(current track's album) & "\""
        set out to out & ", \"duration\": " & current track's duration
        set out to out & ", \"name\": \"" & my escape_quotes(current track's name) & "\""
        set out to out & "}"
      end
      set out to out & "}"
    end tell
  end using terms from
end if
