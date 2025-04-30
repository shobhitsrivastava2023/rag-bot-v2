-- Create a table for storing document metadata
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  chunk_count INTEGER NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
