import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-base-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/new" element={<CreateEventPage />} />
        </Routes>
      </div>
    </Router>
  )
}

// Placeholder components
function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Sport Connect</h1>
      <p className="text-lg">Welcome to Sport Connect - Find and organize recreational sports events!</p>
    </div>
  )
}

function EventDetailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Event Details</h1>
      <p>Event details will appear here.</p>
    </div>
  )
}

function CreateEventPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Create New Event</h1>
      <p>Event creation form will appear here.</p>
    </div>
  )
}

export default App
