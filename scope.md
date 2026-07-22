# QUIZLY

# Color Palette

- Background #0D0D1A
- Surface #16162A cards
- Chat surface #1E1E3A
- Border #2A2A2A
- Muted text #A1A1AA
- Electric violet #7C3AED primary accent
- Neon green #22C55E secondary
- Amber #F59E0B warning
- Red #EF4444 danger
- Text #F4F4F8 primary

## Auth Model

**Players - no account required**

- Join any game with room code
- Pick a username and avatar color
- Answer questions, chat in real time
- see live leaderboard and podium
- Save stats and have achievements = Account required
- Create or hosts quizzes = Account Required

**Host - Account required**

- Build and save quizzes to library
- Host live games
- Publish quizzes to discovery page
- Re-host quizzes
- Everything a player can do

## Features

- Join a room (Enter code, pick a username, choose a color)
- Simple Sign in Sign Up with credentials and google
- Draft, Publish, Create, Host Quizzes
- Each Question can have up to 4 answers
- AI can generate a quiz based off title
- AI can generate answers based off the question & title
- Select a timeframe for questions and point value
- On publish, add cover images, category, difficulty, tags
- Discovery page, Share, Save, Host quizzes
- Options - Shuffle Questions, Allow late joins, Show correct answers, Disable chat
- Live Chat
- Presenter View to see whats happening live
- Host can kick players, mute players from chat, end current question before timer runs out, end game early
- lobby screen of players joining/ready
- After each question show leaderboard
- Save user score if signed in
- Podium screen at end of quiz
- End screen star review to rate the quiz out of 5 stars
- Host Summary screen (players, average correct answer, average response) Question breakdown (winner, Fastest Responder, Hardest question)

# Dashboard

- Games played
- Average Score
- Best finish
- Wins
- recent game results
- Previously hosted quizzes
- Achievements
- Profile (allow upload avatar), Display name, Email, Change Password

## Edge cases

- Room not found
- Disconnected, reconnection
- Removed from lobby
- Empty lobby

## Question Types

- Multiple Choice — 4 options, one correct
- Single Choice — 2-3 options, one correct
- True / False — two options

# Bonus features

- Chat reactions
- Teams game mode — major state complexity
- Last one standing — different game loop entirely
- Speed-run mode — different scoring system
- Shareable result screen — public URL generation
- Save score on sign in
- Unlisted / Private quizzes — visibility system

## Room Codes

- 6 character alphanumeric — e.g. XK92P3
- Generated on session create
- Expires after game ends or 24hrs inactive
