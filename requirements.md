# Multiplayer Chat - Open Ended
We are creating a website, a server and a client, where participants can log in and chat in real time.

The website will be open ended, meaning we can add more multiplayer functionality with time.

## Code Organization
- We will intend to deploy the website on Vercel. This means we ought to create any vercel configurations necessary as we go.
- All code can go into one git repo, but we should have isolated directories `client` and `server` to hold frontend and backend code respectively.
- The backend will use python. The frontend will use Next.js with shadcn and Tailwind CSS for UI

## Features
- The backend will use websockets to ensure that many players can retain in sessions with the server and other players for long periods of time.
- There will be no log in flow or registration. Anyone can join a session without credentials.
- The home page of the website will simply be a chat room. Players can type messages and click send. The server and accordingly other players should be able to see the contents of the chat and respond back.
- We are starting with only chat functionality, but we intend to build more multiplayer features in the future : such as interactive games between players.
- Players should be able to customize their names for the chat. The chat will display which player name sent a specific message.