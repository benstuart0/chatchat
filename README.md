# Real-time Chat Application

A real-time chat application built with Next.js, FastAPI, and WebSocket.

## Features

- Real-time messaging using WebSockets
- Modern UI with shadcn/ui components
- No authentication required - just join and start chatting
- System messages for user join/leave events

## Project Structure

- `client/` - Next.js frontend application
- `server/` - FastAPI backend application

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- pip (Python package manager)

## Getting Started

### Starting the Backend Server

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

The server will start on http://localhost:8000

### Starting the Frontend Application

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will start on http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Start chatting! Messages will be broadcast to all connected users
3. The system will notify when users join or leave the chat

## Future Enhancements

- User authentication
- Private messaging
- Multiple chat rooms
- Interactive multiplayer games
- Message history
- File sharing 