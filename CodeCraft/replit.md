# Real-Time Chat Application

## Overview

A real-time chat application built with React and Express featuring WebSocket communication, user registration, and a Discord-inspired UI. The application provides instant messaging capabilities with typing indicators, user presence tracking, and avatar customization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for development
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Discord-inspired dark theme
- **State Management**: React hooks with custom chat hook for WebSocket state
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **WebSocket**: Native WebSocket server for real-time communication
- **Storage**: In-memory storage with interface for potential database migration
- **Session Management**: Express sessions with PostgreSQL session store support
- **API Design**: RESTful endpoints for user management with WebSocket for messaging

### Component Structure
- **Chat Components**: Modular chat interface with separate components for messages, users, input, and registration
- **UI Components**: Comprehensive component library with consistent theming
- **Responsive Design**: Mobile-first approach with virtual keyboard support

### Real-Time Features
- **WebSocket Communication**: Bidirectional real-time messaging
- **Typing Indicators**: Live typing status with automatic timeout
- **User Presence**: Online status tracking and display
- **Message Broadcasting**: Instant message delivery to all connected users

### Data Models
- **Users**: ID, username, avatar color, online status, timestamps
- **Messages**: ID, content, user information, timestamps
- **Session Management**: User authentication state and WebSocket connection mapping

### Storage Strategy
- **Current**: In-memory storage for development and testing
- **Future**: Database migration support through storage interface abstraction
- **Session Store**: PostgreSQL-ready session configuration

## External Dependencies

### Core Framework Dependencies
- **@vitejs/plugin-react**: React support for Vite
- **express**: Web application framework
- **ws**: WebSocket implementation for real-time communication

### UI and Styling
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class utilities

### Database and Validation
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-zod**: Schema validation integration
- **zod**: Runtime type validation

### Development Tools
- **typescript**: Type safety and development experience
- **vite**: Fast development server and build tool
- **tsx**: TypeScript execution for development

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration

### Session and Authentication
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **express-session**: Session middleware (configured but not actively used)

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **wouter**: Lightweight routing library